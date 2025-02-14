import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StreamVideo from "./pages/stream-video";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Loader />
              <Leva hidden />
              <UI />
              <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
                <Experience />
              </Canvas>
            </>
          }
        />
        <Route path="/stream-video" element={<StreamVideo />} />
      </Routes>
    </Router>
  );
}

export default App;
