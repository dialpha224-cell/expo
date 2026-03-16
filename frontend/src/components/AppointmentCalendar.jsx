import { useState, useEffect } from "react";
import { API } from "../App";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  Scissors,
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "./ui/button";

const AppointmentCalendar = ({ salonId, onSelectAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salonId) {
      fetchAppointments();
    }
  }, [salonId, currentDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await axios.get(
        `${API}/salons/${salonId}/appointments?year=${year}&month=${month}`,
        { withCredentials: true }
      );
      setAppointments(response.data);
    } catch (error) {
      console.log("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getAppointmentsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => {
      const aptDate = apt.appointment_date || apt.date;
      return aptDate === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const statusColors = {
    pending: "bg-amber-500",
    confirmed: "bg-blue-500",
    in_progress: "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500"
  };

  const today = new Date();
  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6" data-testid="appointment-calendar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          Calendrier des RDV
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigateMonth(-1)}
            variant="outline"
            size="sm"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium px-4">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button
            onClick={() => navigateMonth(1)}
            variant="outline"
            size="sm"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square p-1"></div>
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayAppointments = getAppointmentsForDay(day);
          const hasAppointments = dayAppointments.length > 0;
          const isSelected = selectedDate === day;
          
          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(isSelected ? null : day)}
              className={`aspect-square p-1 rounded-lg relative transition-all ${
                isToday(day) 
                  ? "bg-indigo-600/30 border-2 border-indigo-500" 
                  : isSelected
                    ? "bg-slate-700 border-2 border-indigo-400"
                    : "hover:bg-slate-700/50"
              }`}
              data-testid={`calendar-day-${day}`}
            >
              <span className={`text-sm ${isToday(day) ? "text-indigo-300 font-bold" : "text-slate-300"}`}>
                {day}
              </span>
              
              {/* Appointment indicators */}
              {hasAppointments && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayAppointments.slice(0, 3).map((apt, idx) => (
                    <div 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${statusColors[apt.status] || "bg-slate-500"}`}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <span className="text-[8px] text-slate-400">+{dayAppointments.length - 3}</span>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-slate-700"
        >
          <h4 className="text-white font-medium mb-4">
            {selectedDate} {monthNames[currentDate.getMonth()]} - {getAppointmentsForDay(selectedDate).length} RDV
          </h4>
          
          {getAppointmentsForDay(selectedDate).length === 0 ? (
            <p className="text-slate-400 text-sm">Aucun rendez-vous ce jour</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getAppointmentsForDay(selectedDate).map((apt) => (
                <div 
                  key={apt.appointment_id}
                  onClick={() => onSelectAppointment && onSelectAppointment(apt)}
                  className="bg-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {apt.appointment_time || apt.time}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[apt.status]}/20 text-white`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {apt.client_name || "Anonyme"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3 h-3" />
                      {apt.haircut_name || "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700 flex flex-wrap gap-4 text-xs">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-slate-400 capitalize">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentCalendar;
