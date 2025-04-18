import React, { useState, useEffect, useRef } from "react";
import "../styles/Dashboard.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faHeart,
  faHome,
  faFileAlt,
  faExclamationTriangle,
  faCalendarCheck,
  faUser,
  faChartLine,
  faCalendarPlus,
  faRightFromBracket,
  faSearch,
  faCircleDot,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Dashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [otherDeadlines, setOtherDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  const options = [
    { value: "due_date_asc", label: "Data (Ascendente)" },
    { value: "due_date_desc", label: "Data (Discendente)" },
    { value: "title_asc", label: "Titolo (A-Z)" },
    { value: "title_desc", label: "Titolo (Z-A)" },
    { value: "type", label: "Categoria" },
    { value: "notifications_on", label: "Stato Notifica" },
  ];

  const typeIcons = {
    Salute: faHeart,
    Garage: faCar,
    Casa: faHome,
    Documenti: faFileAlt,
    Altro: faExclamationTriangle,
    Lavoro: faCalendarCheck,
    Personale: faUser,
  };

  const userId = 1; // ID utente simulato // TEMPORANEO!!!!!!!!!!!!!!!!!!

  useEffect(() => {
    const fetchUserAndDeadlines = async () => {
      try {
        // Recupera tutti gli utenti
        const usersResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/users`
        );

        // Filtra l'utente con ID 1
        const currentUser = usersResponse.data.find((user) => user.id === 1);
        if (!currentUser) {
          throw new Error("Utente con ID 1 non trovato");
        }
        setUser(currentUser);

        // Recupera tutte le scadenze
        const deadlinesResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/deadlines`
        );

        // Filtra le scadenze per l'utente corrente
        const userDeadlines = deadlinesResponse.data.filter(
          (deadline) => deadline.user_id === currentUser.id
        );

        // Ordina le scadenze per data
        const sortedDeadlines = userDeadlines.sort(
          (a, b) => new Date(a.due_date) - new Date(b.due_date)
        );

        // Imposta le prossime 3 scadenze e le altre
        setUpcomingDeadlines(sortedDeadlines.slice(0, 3));
        setOtherDeadlines(sortedDeadlines.slice(3));
        setLoading(false);
      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
        setLoading(false);
      }
    };

    fetchUserAndDeadlines();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("it-IT", options);
  };

  const handleSort = (sortOption) => {
    let sortedDeadlines = [...otherDeadlines];

    switch (sortOption) {
      case "due_date_asc":
        sortedDeadlines.sort(
          (a, b) => new Date(a.due_date) - new Date(b.due_date)
        );
        break;
      case "due_date_desc":
        sortedDeadlines.sort(
          (a, b) => new Date(b.due_date) - new Date(a.due_date)
        );
        break;
      case "title_asc":
        sortedDeadlines.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        sortedDeadlines.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "type":
        sortedDeadlines.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "notifications_on":
        sortedDeadlines.sort((a, b) => b.notifications_on - a.notifications_on);
        break;
      default:
        break;
    }

    setOtherDeadlines(sortedDeadlines);
  };

  const handleOptionClick = (optionValue) => {
    setSelectedOption(optionValue);
    handleSort(optionValue);
    setTimeout(() => setIsDropdownOpen(false), 0);
  };

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setIsDropdownOpen((prevState) => !prevState);
    } else if (event.key === "Escape") {
      setIsDropdownOpen(false); // Chiude il menu se si preme Esc
    }
  };

  const handleOptionKeyDown = (event, optionIndex) => {
    if (event.key === "Enter") {
      handleOptionClick(options[optionIndex].value);
    } else if (event.key === "Tab") {
      event.preventDefault(); // Impedisce il comportamento predefinito del Tab
      const nextIndex = (optionIndex + 1) % options.length; // Calcola l'indice successivo
      const nextOption = document.querySelectorAll(".option")[nextIndex];
      nextOption.focus(); // Sposta il focus alla prossima opzione
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false); // Chiude il menu se si clicca fuori
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDeadlines = otherDeadlines.filter((deadline) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      deadline.title.toLowerCase().includes(searchLower) ||
      deadline.type.toLowerCase().includes(searchLower) ||
      formatDate(deadline.due_date).toLowerCase().includes(searchLower) ||
      deadline.description.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <aside className="sidebar">
          <Link to={"/dashboard"} className="logo">
            <span>Home</span>Cloud
          </Link>
          <nav className="sidebar-nav">
            <ul>
              <li className="active">
                <a href="/">
                  <FontAwesomeIcon icon={faChartLine} className="icon" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="/add-deadline">
                  <FontAwesomeIcon icon={faCalendarPlus} className="icon" />
                  <span>Aggiungi Scadenza</span>
                </a>
              </li>
            </ul>
          </nav>
          <a href="/profile" className="user-profile">
            <div className="avatar"></div>
            <div className="user-info">
              <div className="name">Nome Utente</div>
              <div className="email">email@example.com</div>
            </div>
          </a>
          <nav className="sidebar-bottom-nav">
            <button className="logout-button" onClick={() => alert("Logout")}>
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="icon logout-icon"
              />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <Link to={"/dashboard"} className="logo">
          <span>Home</span>Cloud
        </Link>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <a href="/">
                <FontAwesomeIcon icon={faChartLine} className="icon" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/add-deadline">
                <FontAwesomeIcon icon={faCalendarPlus} className="icon" />
                <span>Aggiungi Scadenza</span>
              </a>
            </li>
          </ul>
        </nav>
        <a href="/profile" className="user-profile">
          <div className="avatar"></div>
          <div className="user-info">
            <div className="name">{user?.full_name || "Nome Utente"}</div>
            <div className="email">{user?.email || "Email Utente"}</div>
          </div>
        </a>
        <nav className="sidebar-bottom-nav">
          <button className="logout-button" onClick={() => alert("Logout")}>
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="icon logout-icon"
            />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Upcoming Deadlines Section */}
        <section className="cards-section">
          <h2 className="section-title">Prossime Scadenze</h2>
          <div className="cards-grid">
            {upcomingDeadlines.map((deadline, index) => (
              <Link
                to={`/deadline-details/${deadline.id}`}
                key={deadline.id}
                className={`card upcoming-deadline-card card-gradient-${
                  index + 1
                }`}
              >
                <div className="card-content">
                  <div className="card-header">
                    <div className="card-title">
                      <FontAwesomeIcon
                        icon={typeIcons[deadline.type] || faExclamationTriangle}
                        className="deadline-icon"
                      />
                      {deadline.title}
                    </div>
                    <div
                      className={`card-type ${deadline.type
                        .toLowerCase()
                        .replace(" ", "-")}-type`}
                    >
                      {deadline.type}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="due-date">
                      Scade il: {formatDate(deadline.due_date)}
                    </div>
                    <div className="description">
                      <strong>Descrizione</strong>: {deadline.description}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="other-deadlines-section">
          <h2 className="section-title">Altre Scadenze</h2>
          <div className="deadlines-header">
            <div className="deadlines-filter">
              <div className="search-input">
                <FontAwesomeIcon icon={faSearch} className="icon search-icon" />
                <input
                  type="text"
                  placeholder="Cerca scadenze..."
                  value={searchTerm} // Colleghiamo lo stato al campo di input
                  onChange={handleSearchChange} // Gestore per l'input di ricerca
                />
                {searchTerm && (
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="icon clear-icon"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
              <div
                className={`custom-select ${isDropdownOpen ? "open" : ""}`}
                ref={dropdownRef}
                tabIndex={0}
                onClick={toggleDropdown}
                onKeyDown={handleKeyDown}
              >
                <div
                  className={`selected-option ${
                    selectedOption === "" ? "placeholder" : ""
                  }`}
                >
                  {selectedOption
                    ? options.find((opt) => opt.value === selectedOption)?.label
                    : "Seleziona un'opzione"}
                </div>
                {isDropdownOpen && (
                  <ul className="options">
                    {options.map((option, index) => (
                      <li
                        key={option.value}
                        className="option"
                        onClick={() => handleOptionClick(option.value)}
                        onKeyDown={(event) => handleOptionKeyDown(event, index)}
                        tabIndex={0}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Deadlines Table */}
          <div className="deadlines-table-container">
            <table className="deadlines-table">
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Categoria</th>
                  <th>Scadenza</th>
                  <th>Descrizione</th>
                  <th>Stato Notifica</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredDeadlines.length > 0 ? (
                  filteredDeadlines.map((deadline) => (
                    <tr key={deadline.id}>
                      <td>
                        <FontAwesomeIcon
                          icon={
                            typeIcons[deadline.type] || faExclamationTriangle
                          }
                          className="deadline-icon"
                        />
                        <span>{deadline.title}</span>
                      </td>
                      <td>
                        <span
                          className={`deadline-type ${deadline.type
                            .toLowerCase()
                            .replace(" ", "-")}-type`}
                        >
                          {deadline.type}
                        </span>
                      </td>
                      <td>{formatDate(deadline.due_date)}</td>
                      <td>{deadline.description}</td>
                      <td>
                        <span
                          className={`notification-status ${
                            deadline.notifications_on === 1 ? "true" : "false"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faCircleDot}
                            className="notification-icon"
                          />
                          {deadline.notifications_on === 1 ? "On" : "Off"}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/deadline-details/${deadline.id}`}
                          className="dots-container"
                        >
                          <span className="dots-icon"></span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Nessuna scadenza trovata.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
