import Lottie from "lottie-react";
import animationdata from "@/public/lottie/money.json"
export default function LottieAnimation() {
  return <Lottie animationData={animationData} loop={true} />;
}