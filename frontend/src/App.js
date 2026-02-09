import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import {
  FaPlaneDeparture,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaRoute,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    from_city: "",
    to_city: "",
    days: "",
    budget: "",
    transport_mode: ""
  });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const transports = [
    { value: "train", label: "🚆 Train" },
    { value: "bus", label: "🚌 Bus" },
    { value: "flight", label: "✈ Flight" },
    { value: "private", label: "🚗 Private Vehicle" }
  ];

  const handleGenerate = async () => {
    if (Object.values(formData).some(v => !v)) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/plan", formData);
      setPlans(res.data.plans);
    } catch {
      alert("Backend Error");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (id) => {
    const element = document.getElementById(`plan-${id}`);
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, width, height);
    pdf.save(`Travel_Plan_${id}.pdf`);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <FaPlaneDeparture size={28} color="#4f46e5" />
        <h1>AI Travel Planner</h1>
      </header>

      {/* Hero */}
      <section className="hero">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Plan Your Dream Trip
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          AI-powered luxury travel plans for India
        </motion.p>
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
      </section>

      {/* Form */}
      <motion.div
        className="formCard"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inputGroup">
          <FaMapMarkerAlt className="icon" />
          <input
            placeholder="From City"
            value={formData.from_city}
            onChange={e => setFormData({ ...formData, from_city: e.target.value })}
          />
        </div>

        <div className="inputGroup">
          <FaMapMarkerAlt className="icon" />
          <input
            placeholder="To City"
            value={formData.to_city}
            onChange={e => setFormData({ ...formData, to_city: e.target.value })}
          />
        </div>

        <div className="inputGroup">
          <FaCalendarAlt className="icon" />
          <input
            type="number"
            placeholder="Number of Days"
            value={formData.days}
            onChange={e => setFormData({ ...formData, days: e.target.value })}
          />
        </div>

        <div className="inputGroup">
          <FaRupeeSign className="icon" />
          <input
            type="number"
            placeholder="Budget ₹"
            value={formData.budget}
            onChange={e => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        {/* Transport Pills */}
        <div className="transportWrapper">
          {transports.map(t => (
            <div
              key={t.value}
              className={`transport-pill ${formData.transport_mode === t.value ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, transport_mode: t.value })}
            >
              {t.label}
            </div>
          ))}
        </div>

        <motion.button
          className="generateBtn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
        >
          <FaRoute /> Generate Plans
        </motion.button>
      </motion.div>

      {loading && <div className="loader"></div>}

      {/* Plans */}
      <div className="planWrapper">
        {plans.map(plan => (
          <motion.div
            key={plan.planId}
            className="planCard"
            id={`plan-${plan.planId}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: plan.planId * 0.2 }}
          >
            <div className="planHeader">
              <h3>Plan {plan.planId}</h3>
              {plan.budgetWarning ? (
                <motion.span
                  className="badge danger"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <FaExclamationTriangle /> Over Budget
                </motion.span>
              ) : (
                <motion.span
                  className="badge success"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <FaCheckCircle /> Within Budget
                </motion.span>
              )}
            </div>

            <motion.div
              className="totalCost"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Total Cost: ₹ {plan.totalCost}
            </motion.div>

            {plan.days.map(day => (
              <motion.div
                key={day.day}
                className="dayCard"
                whileHover={{ scale: 1.03, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <h4>Day {day.day}</h4>
                <p>📍 {day.spots.join(", ")}</p>
                <p>🍴 {day.restaurants.join(", ")}</p>
                <p>🏨 {day.stay.join(", ")}</p>
              </motion.div>
            ))}

            <motion.button
              className="downloadBtn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => downloadPDF(plan.planId)}
            >
              <FaDownload /> Download Plan
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default App;
