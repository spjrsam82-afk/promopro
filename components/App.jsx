import React, { useState } from "react";
import seoContent from "./components/seocontent";
import footer from "./components/footer";
import promofooter from "./components/promofooter";

function App() {
  return (
    <>
      <seocontent />
      
      <h1 style={{color:"white"}}>TEST APP IS WORKING</h1>

      {/* your other content here */}

      <promofooter />
      <footer />
    </>
  );
}

export default App;

