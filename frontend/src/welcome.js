import React from "react";
import kitchenGif from "./assets/kitchen.gif";
import unknownImg from "./assets/unknown.jpg"; // Import the placeholder profile picture
import "./welcome.css";

function Welcome() {
  return (
    <div className="page-wrapper">
      {/* --- Hero Section (unchanged) --- */}
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

      {/* --- Meet the Team Section --- */}
      <div className="team-section">
        <h2 className="team-title">Meet the Team</h2>

        <div className="team-roles">
          {/* Waiters */}
          <div className="team-category">
            <h3>Waiters</h3>
            <p>Our friendly wait staff is here to serve you with a smile.</p>
            <div className="team-members">

              {/* James */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="James"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>James</h4>
                  <p className="staff-quote">
                    "I love bringing a piece of Mexico to every table I serve!"
                  </p>
                </div>
              </div>

              {/* Connor */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="Connor"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>Connor</h4>
                  <p className="staff-quote">
                    "Nothing beats seeing our guests light up after the first bite."
                  </p>
                </div>
              </div>

              {/* Markus */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="Markus"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>Markus</h4>
                  <p className="staff-quote">
                    "It's a fiesta every day—I love being part of such a vibrant atmosphere!"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kitchen Staff */}
          <div className="team-category">
            <h3>Kitchen Staff</h3>
            <p>Passionate chefs and cooks bringing authentic Mexican flavors to life.</p>
            <div className="team-members">

              {/* Arion */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="Arion"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>Arion</h4>
                  <p className="staff-quote">
                    "Fresh ingredients and secret spices—I'm living my culinary dream!"
                  </p>
                </div>
              </div>

              {/* Leand */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="Leand"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>Leand</h4>
                  <p className="staff-quote">
                    "Turning traditional recipes into masterpieces is what I do best."
                  </p>
                </div>
              </div>

              {/* Amit */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="Amit"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>Amit</h4>
                  <p className="staff-quote">
                    "Every dish is a story—I'm proud to share Mexico's story through food."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Managers */}
          <div className="team-category">
            <h3>Managers</h3>
            <p>Keeping everything running smoothly, from opening time to last call.</p>
            <div className="team-members">

              {/* Joshua */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="Joshua"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>Joshua</h4>
                  <p className="staff-quote">
                    "Ensuring both customers and staff are happy is my number one goal."
                  </p>
                </div>
              </div>

              {/* Max */}
              <div className="staff-member">
                <img
                  src={unknownImg}
                  alt="Max"
                  className="profile-pic"
                />
                <div className="staff-info">
                  <h4>Max</h4>
                  <p className="staff-quote">
                    "I love the energy here—it's like a family that lives and breathes Mexican culture."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
