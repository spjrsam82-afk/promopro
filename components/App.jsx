import React, { useState } from "react";
import SeoContent from "./components/SeoContent";
import Footer from "./components/Footer";
import PromoFooter from "./components/App.jsx/PromoFooter";

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

