import React from 'react';
import { motion } from 'framer-motion';

const BenefitSection = () => {

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
                     <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
             왜 <span className="text-blue-600">세일즈 파트너</span>를 선택해야 할까요?
           </h2>
           <div className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto space-y-3 sm:space-y-4 px-4 sm:px-0">
             <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">
               새로운 마케팅 플랫폼.<br className="sm:hidden" />
               <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block mt-1 sm:mt-0">AI광고+소비+쇼핑=수익창출</span>
             </div>
             <div className="text-sm sm:text-base md:text-lg leading-relaxed">
               세일즈파트너스만의 광고 플랫폼을 활용하여<br className="sm:hidden" />
               새로운 수익을 창출하는 시스템입니다.
             </div>
           </div>
                 </motion.div>
      </div>
    </section>
  );
};

export default BenefitSection; 