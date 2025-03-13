import React from "react";
import kitchenGif from "./assets/kitchen.gif"; // Ensure the file is in the correct directory
import "./welcome.css"; // Import external CSS file

function Welcome() {
  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Welcome to Oaxaca - A Modern Mexican Dining Experience</h1>
      <p className="welcome-text">Indulge in the rich flavors of Mexico, reimagined with a modern twist.</p>
      <p className="welcome-text">At Oaxaca, we blend traditional recipes with secret techniques to bring you an unforgettable culinary journey.</p>
      <p className="welcome-text">Enjoy handcrafted tacos, fresh ceviche, and artisanal cocktails inspired by the vibrant streets of Mexico.</p>
      <img src={kitchenGif} alt="Oaxaca Kitchen" className="kitchen-image" />
    </div>
  );
}

export default Welcome;
