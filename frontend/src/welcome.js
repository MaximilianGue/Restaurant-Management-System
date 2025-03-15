import React from "react";
import kitchenGif from "./assets/kitchen.gif";
import "./welcome.css";

function Welcome() {
  return (
    <div className="page-wrapper">
      {/* --- Existing Side-by-Side Layout --- */}
      <div className="welcome-container">
        <div className="welcome-text-section">
          <h1 className="welcome-title">
            Welcome to Oaxaca - A Modern Mexican Dining Experience
          </h1>
          <p className="welcome-text">
            Indulge in the rich flavors of Mexico, reimagined with a modern twist.
          </p>
          <p className="welcome-text">
            At Oaxaca, we blend traditional recipes with secret techniques to bring
            you an unforgettable culinary journey.
          </p>
          <p className="welcome-text">
            Enjoy handcrafted tacos, fresh ceviche, and artisanal cocktails inspired
            by the vibrant streets of Mexico.
          </p>
        </div>
        <div className="welcome-image-section">
          <img src={kitchenGif} alt="Oaxaca Kitchen" className="kitchen-image" />
        </div>
      </div>

      {/* --- New Meet the Team Section --- */}
      <div className="team-section">
        <h2 className="team-title">Meet the Team</h2>
        <div className="team-roles">
          <div className="team-category">
            <h3>Waiters</h3>
            <p>Our friendly wait staff is here to serve you with a smile.</p>
          </div>
          <div className="team-category">
            <h3>Kitchen Staff</h3>
            <p>
              Passionate chefs and cooks bringing authentic Mexican flavors to life.
            </p>
          </div>
          <div className="team-category">
            <h3>Managers</h3>
            <p>
              Keeping everything running smoothly, from opening time to last call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
