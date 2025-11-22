import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { tips } from '../data/gameData';
import { EmailForm } from './EmailForm';
import { FaLightbulb, FaClipboardList, FaTrophy, FaCheckCircle, FaGraduationCap, FaBook, FaUsers } from 'react-icons/fa';
import { GiPartyPopper } from 'react-icons/gi';

export function EndingScreen() {
  const { coins, wisdom, achievements, postTestScore, resetGame } = useGameStore();
  const [showEmailForm, setShowEmailForm] = useState(true);
  
  return (
    <div className="min-h-screen pt-28 pb-10">
      <div className="container max-w-4xl mx-auto px-5">
        <div className="glass-card text-center animate-scale-in">
          <h1 className="text-5xl font-bold mb-6 flex items-center justify-center gap-3">
            <GiPartyPopper className="text-yellow-400" />
            Поздравляем!
          </h1>
          
          <p className="text-2xl mb-8 opacity-90">
            Ты прошёл все испытания и стал настоящим Финансовым Детективом!
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            <div className="bg-white/15 backdrop-blur-lg p-6 rounded-2xl border-2 border-white/30 min-w-[150px]">
              <div className="text-5xl font-bold mb-2">🪙</div>
              <div className="text-4xl font-bold mb-2">{coins}</div>
              <div className="text-base opacity-90">Монет</div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-lg p-6 rounded-2xl border-2 border-white/30 min-w-[150px]">
              <div className="text-5xl font-bold mb-2 flex justify-center">
                <FaLightbulb className="text-yellow-400" />
              </div>
              <div className="text-4xl font-bold mb-2">{wisdom}%</div>
              <div className="text-base opacity-90">Мудрости</div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-lg p-6 rounded-2xl border-2 border-white/30 min-w-[150px]">
              <div className="text-5xl font-bold mb-2 flex justify-center">
                <FaClipboardList className="text-blue-400" />
              </div>
              <div className="text-4xl font-bold mb-2">{postTestScore}/10</div>
              <div className="text-base opacity-90">Финальный тест</div>
            </div>
          </div>
          
          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <FaTrophy className="text-yellow-400" />
                Достижения
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className="text-2xl p-4 bg-gradient-to-br from-secondary to-orange-400 rounded-xl inline-block animate-float"
                  >
                    {achievement}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tips Section */}
          <div className="mt-8 text-left">
            <h3 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
              <FaLightbulb className="text-yellow-400" />
              Помни эти правила:
            </h3>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div 
                  key={index}
                  className="p-4 bg-white/10 rounded-xl border-l-4 border-success"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-12 p-6 bg-primary/20 rounded-2xl border-2 border-primary/40">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-3">
              <FaGraduationCap className="text-primary" />
              Ты теперь можешь:
            </h3>
            <ul className="text-lg text-left max-w-2xl mx-auto space-y-2">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-success flex-shrink-0" /> Распознавать финансовое мошенничество</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-success flex-shrink-0" /> Задавать правильные контрольные вопросы</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-success flex-shrink-0" /> Видеть красные флажки</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-success flex-shrink-0" /> Защищать свои деньги и деньги близких</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-success flex-shrink-0" /> Делиться знаниями с друзьями</li>
            </ul>
          </div>
          
          {/* Email Form */}
          {showEmailForm && (
            <div className="mt-12">
              <EmailForm onSubmit={() => setShowEmailForm(false)} />
            </div>
          )}
          
          {/* Buttons */}
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <button 
              className="btn btn-primary"
              onClick={resetGame}
            >
              🔄 Играть снова
            </button>
            
            <button 
              className="btn bg-secondary"
              onClick={() => useGameStore.getState().toggleMaterialsPanel()}
            >
              <FaBook className="inline mr-2" />
              Открыть справочник
            </button>
          </div>
          
          <div className="mt-8 text-lg opacity-80 flex items-center justify-center gap-2">
            <FaUsers />
            Расскажи друзьям о том, что узнал! Вместе мы защитим больше людей от мошенников!
          </div>
        </div>
      </div>
    </div>
  );
}

