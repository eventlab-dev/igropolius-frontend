import { Html } from "@react-three/drei";
import { LoaderCircleIcon } from "lucide-react";

function SceneLoader() {
  return (
    <Html zIndexRange={[0, 0]} center>
      <LoaderCircleIcon className="animate-spin text-primary" size={54} />
    </Html>
  )
}

export default SceneLoader;
