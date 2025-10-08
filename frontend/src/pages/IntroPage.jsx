// frontend/src/pages/IntroPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const IntroPage = () => {
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Makes children appear one after another
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10" />

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          className="text-lg md:text-xl text-primary mb-2"
          variants={itemVariants}
        >
          OUR NEW AI ASSISTANT FOR
        </motion.p>
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8"
          variants={itemVariants}
        >
          INTERVIEW
        </motion.h1>

        <motion.div variants={itemVariants}>
          <Link to="/coach">
            <Button size="lg" className="text-lg px-8 py-6">
              ENTER <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntroPage;