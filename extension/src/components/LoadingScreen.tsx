import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-xs text-[#6b6b7a]">Loading problem…</p>
    </div>
  );
}
