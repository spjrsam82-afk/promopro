import React, { useState } from "react";
import SeoContent from "./components/seocontent";
import Footer from "./components/footer";
import PromoFooter from "./components/promofooter";

function App() {
  return (
    <>
      <SeoContent />
      
      <h1 style={{color:"white"}}>TEST APP IS WORKING</h1>

      {/* your other content here */}

      <PromoFooter />
      <Footer />
    </>
  );
}

export default App;

