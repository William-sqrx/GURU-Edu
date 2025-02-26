import React, { useState } from "react";
import StreamVideo from "./stream-video";

export default function HomePage() {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        setImage(imageData);
        await uploadImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (imageData) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user?.email;
    console.log("Email:", email);
    if (!email) {
      console.error("User email not found in local storage");
      return;
    }
    console.log("body:", JSON.stringify({ email, photo_url: imageData }));
    const response = await fetch("/api/userss", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, photo_url: imageData }),
    });

    if (!response.ok) {
      console.error("Failed to upload image");
    } else {
      const result = await response.json();
      console.log("Image uploaded successfully", result);
    }
  };

  return (
    <div>
      <div>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {image && (
          <img
            src={image}
            alt="Uploaded"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        )}
      </div>
      <StreamVideo />
    </div>
  );
}
