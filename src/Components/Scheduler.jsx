import React, { useEffect, useState } from 'react';
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import DatePicker from "react-datepicker";
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Scheduler.css';
import axios from 'axios';

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const Scheduler = () => {
    const [newEvent, setNewEvent] = useState({ title: "", start: null, end: null });
    const [allEvents, setAllEvents] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [allTasks, setAllTasks] = useState([]);

    useEffect(() => {
        axios.get('http://192.168.1.42:5000/api/inspection-requests')
            .then(res => {
                const transformedEvents = res.data.map(task => {
                    if (task.assigned_date) {
                        return {
                            title: task.property.address,
                            start: new Date(task.assigned_date),
                            end: new Date(task.assigned_date),
                        };
                    }
                    return null;
                }).filter(event => event !== null);
                setAllEvents(transformedEvents);
                setAllTasks(res.data);
            })
            .catch(err => console.error(err));
    }, []);

    console.log(allTasks);

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.start || !newEvent.end) {
            toast.error("Please fill in all fields");
            return;
        }

        for (let i = 0; i < allEvents.length; i++) {
            const event = allEvents[i];
            if ((new Date(event.start) <= new Date(newEvent.start) && new Date(newEvent.start) <= new Date(event.end)) ||
                (new Date(event.start) <= new Date(newEvent.end) && new Date(newEvent.end) <= new Date(event.end))) {
                toast.error("Event clash detected!");
                return;
            }
        }

        setAllEvents([...allEvents, newEvent]);
        setNewEvent({ title: "", start: null, end: null });
        setModalIsOpen(false);
        toast.success("Event added successfully!");
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setNewEvent({ title: event.title, start: event.start, end: event.end });
        setModalIsOpen(true);
    };

    const handleUpdateEvent = () => {
        setAllEvents(allEvents.map(event => (event === selectedEvent ? newEvent : event)));
        setNewEvent({ title: "", start: null, end: null });
        setSelectedEvent(null);
        setModalIsOpen(false);
        toast.success("Event updated successfully!");
    };

    return (
        <div className="container main-container">
            <h1 className="text-center mb-4">Calendar</h1>
            <div className="text-center mb-4">
                <button
                    onClick={() => setModalIsOpen(true)}
                    className="btn btn-primary"
                >
                    Add New Event
                </button>
            </div>
            <Calendar
                localizer={localizer}
                events={allEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 350, margin: "50px" }}
                onSelectEvent={handleSelectEvent} 
            />
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                overlayClassName="modal-overlay"
                className="modal-content bg-dark text-white rounded"
                contentLabel="Event Modal"
            >
                <h2 className="mb-4">{selectedEvent ? "Edit Event" : "Add New Event"}</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Add Title"
                        className="form-control mb-2"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <div className='d-flex gap-5'>
                        <div className="mb-2">
                            <DatePicker
                                placeholderText="Start Date"
                                className="form-control mb-2"
                                selected={newEvent.start}
                                onChange={(start) => setNewEvent({ ...newEvent, start })}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                timeCaption="time"
                            />
                        </div>
                        <div className="mb-2">
                            <DatePicker
                                placeholderText="End Date"
                                className="form-control"
                                selected={newEvent.end}
                                onChange={(end) => setNewEvent({ ...newEvent, end })}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                timeCaption="time"
                            />
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-between">
                    <div className="col-auto">
                        <button
                            onClick={selectedEvent ? handleUpdateEvent : handleAddEvent}
                            className="btn btn-primary"
                        >
                            {selectedEvent ? "Update Event" : "Add Event"}
                        </button>
                    </div>
                    <div className="col-auto">
                        <button
                            onClick={() => setModalIsOpen(false)}
                            className="btn btn-danger"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default Scheduler;
