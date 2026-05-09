
import React from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

const PrintableResume = () => {
  const handleDownload = async () => {
    const resumePath = `${import.meta.env.BASE_URL}resume.pdf`;
    const resumeUrl = new URL(resumePath, window.location.href).toString();

    const res = await fetch(resumeUrl);
    if (!res.ok) throw new Error("Failed to download resume");

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        onClick={handleDownload}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center bg-brand-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all mb-8"
      >
        <Download className="mr-2 h-5 w-5" />
        Download Resume
      </motion.button>
    </div>
  );
};

export default PrintableResume;
