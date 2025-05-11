// AI 시뮬레이션 실제 JSON 받아서 할 예정 - 지우지 말것
// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {string} from "prop-types";
//
// const BaseballSimulation = ({ simulationData }) => {
//     const [currentInningIndex, setCurrentInningIndex] = useState(0);
//     const [playIndex, setPlayIndex] = useState(0);
//     const [displayedPlays, setDisplayedPlays] = useState<string[]>([]);
//
//     useEffect(() => {
//         if (!simulationData || simulationData.length === 0) return;
//         if (currentInningIndex >= simulationData.length) return;
//
//         const inning = simulationData[currentInningIndex];
//
//         const timer = setInterval(() => {
//             if (playIndex === 0) {
//                 setDisplayedPlays((prev) => [...prev, `🔔 ${inning.title}`]);
//             }
//
//             if (playIndex < inning.plays.length) {
//                 setDisplayedPlays((prev) => [...prev, inning.plays[playIndex]]);
//                 setPlayIndex((prev) => prev + 1);
//             } else {
//                 clearInterval(timer);
//                 setTimeout(() => {
//                     setCurrentInningIndex((prev) => prev + 1);
//                     setPlayIndex(0);
//                 }, 1000);
//             }
//         }, 1300);
//
//         return () => clearInterval(timer);
//     }, [simulationData, currentInningIndex, playIndex]);
//
//     return (
//         <div className="w-full h-screen bg-black text-white p-6 font-mono text-lg overflow-auto">
//             {displayedPlays.map((play, idx) => (
//                 <motion.div
//                     key={idx}
//                     initial={{ opacity: 0, x: -15 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ duration: 0.4 }}
//                     className="mb-2"
//                 >
//                     {play}
//                 </motion.div>
//             ))}
//         </div>
//     );
// };
//
// export default BaseballSimulation;