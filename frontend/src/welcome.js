import React from "react";
import kitchenGif from "./assets/kitchen.gif"; // Ensure the file is in the correct directory

function Welcome() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Welcome to Oaxaca - A Modern Mexican Dining Experience</h1>
      <p>Indulge in the rich flavors of Mexico, reimagined with a modern twist.</p>
      <p>At Oaxaca, we blend traditional recipes with contemporary techniques to bring you an unforgettable culinary journey.</p>
      <p>Enjoy handcrafted tacos, fresh ceviche, and artisanal cocktails inspired by the vibrant streets of Mexico.</p>
      <img src={kitchenGif} alt="Oaxaca Kitchen" style={{ width: "100%", maxWidth: "600px", marginTop: "1rem", borderRadius: "8px" }} />
    </div>
  );
}

export default Welcome;
