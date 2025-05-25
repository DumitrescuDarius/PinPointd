import { keyframes } from '@mui/system';

// Standard animation keyframes
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

export const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideDown = keyframes`
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const scaleIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animation configurations for common elements
export const cardAnimation = {
  animation: `${fadeIn} 0.5s ease-out forwards`,
};

export const listItemAnimation = (index: number) => ({
  animation: `${fadeIn} 0.5s ${index * 0.1}s ease-out both`,
});

export const navItemAnimation = (index: number) => ({
  animation: `${fadeInRight} 0.3s ${index * 0.05}s ease-out both`,
});

// Standard transition configurations
export const standardTransition = {
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
};

export const buttonTransition = {
  transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
};

export const pageTransition = {
  transition: 'opacity 0.4s ease, transform 0.4s ease',
};

// Animation variants for framer-motion
export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }
  }
};

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Helper function to add delay to animations
export const withDelay = (animation: any, delay: number) => ({
  ...animation,
  animationDelay: `${delay}s`,
}); 