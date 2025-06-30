import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { Hero } from '../../types';

interface SkillEffect {
  id: string;
  name: string;
  type: 'attack' | 'heal' | 'buff' | 'debuff' | 'special';
  animation: SkillAnimation;
  sound?: string;
  particles?: ParticleEffect[];
  shakeScreen?: boolean;
  flashScreen?: { color: string; duration: number };
}

interface SkillAnimation {
  caster: {
    scale?: number;
    rotation?: number;
    glow?: boolean;
    duration: number;
  };
  projectile?: {
    type: 'beam' | 'orb' | 'arrow' | 'lightning';
    color: string;
    speed: number;
    trail?: boolean;
  };
  impact: {
    effect: 'explosion' | 'sparkles' | 'shockwave' | 'healing_light';
    color: string;
    size: number;
    duration: number;
  };
  target: {
    shake?: boolean;
    highlight?: string;
    float?: boolean;
    duration: number;
  };
}

interface ParticleEffect {
  type: 'fire' | 'ice' | 'lightning' | 'healing' | 'dark' | 'light';
  count: number;
  duration: number;
  spread: number;
}

interface AnimationQueueItem {
  skillEffect: SkillEffect;
  casterId: number;
  targetId: number;
  damage?: number;
  healing?: number;
  onComplete?: () => void;
}

interface SkillAnimationSystemProps {
  heroes: Hero[];
  onAnimationComplete?: (animationId: string) => void;
  battleFieldRef: React.RefObject<HTMLDivElement>;
}

const SkillAnimationSystem = React.forwardRef<
  {
    playAnimation: (effect: SkillEffect, casterId: number, targetId: number) => void;
    clearQueue: () => void;
    isPlaying: boolean;
  },
  SkillAnimationSystemProps
>(({ heroes, onAnimationComplete, battleFieldRef }, ref) => {
  const { trackGameEvent } = useAnalytics();
  const [animationQueue, setAnimationQueue] = useState<AnimationQueueItem[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationQueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<{ [key: string]: any[] }>({});
  const [screenShake, setScreenShake] = useState(false);
  const [screenFlash, setScreenFlash] = useState<{ color: string; opacity: number } | null>(null);

  // 音效播放器引用
  const audioRef = useRef<HTMLAudioElement>(null);

  // 预定义技能效果
  const skillEffects: { [key: string]: SkillEffect } = {
    // 物理攻击技能
    slash_attack: {
      id: 'slash_attack',
      name: '斩击',
      type: 'attack',
      animation: {
        caster: { scale: 1.2, glow: true, duration: 500 },
        projectile: {
          type: 'beam',
          color: '#ff6b6b',
          speed: 800,
          trail: true,
        },
        impact: {
          effect: 'shockwave',
          color: '#ff4757',
          size: 1.5,
          duration: 600,
        },
        target: { shake: true, highlight: '#ff6b6b', duration: 400 },
      },
      particles: [{ type: 'fire', count: 20, duration: 800, spread: 50 }],
      shakeScreen: true,
      sound: '/sounds/slash.mp3',
    },

    thrust_attack: {
      id: 'thrust_attack',
      name: '突刺',
      type: 'attack',
      animation: {
        caster: { scale: 1.1, duration: 300 },
        projectile: {
          type: 'arrow',
          color: '#4834d4',
          speed: 1200,
        },
        impact: {
          effect: 'explosion',
          color: '#686de0',
          size: 1.2,
          duration: 400,
        },
        target: { shake: true, highlight: '#4834d4', duration: 300 },
      },
      particles: [{ type: 'lightning', count: 15, duration: 600, spread: 30 }],
    },

    // 法术攻击技能
    fireball: {
      id: 'fireball',
      name: '火球术',
      type: 'attack',
      animation: {
        caster: { scale: 1.3, glow: true, duration: 800 },
        projectile: {
          type: 'orb',
          color: '#ff9f43',
          speed: 600,
          trail: true,
        },
        impact: {
          effect: 'explosion',
          color: '#ff6348',
          size: 2.0,
          duration: 1000,
        },
        target: { shake: true, highlight: '#ff6348', duration: 600 },
      },
      particles: [
        { type: 'fire', count: 30, duration: 1200, spread: 80 },
        { type: 'light', count: 15, duration: 800, spread: 40 },
      ],
      shakeScreen: true,
      flashScreen: { color: '#ff6348', duration: 200 },
      sound: '/sounds/fireball.mp3',
    },

    lightning_bolt: {
      id: 'lightning_bolt',
      name: '闪电箭',
      type: 'attack',
      animation: {
        caster: { scale: 1.2, glow: true, duration: 400 },
        projectile: {
          type: 'lightning',
          color: '#feca57',
          speed: 1500,
        },
        impact: {
          effect: 'sparkles',
          color: '#ff9ff3',
          size: 1.8,
          duration: 800,
        },
        target: { shake: true, highlight: '#feca57', duration: 500 },
      },
      particles: [{ type: 'lightning', count: 25, duration: 1000, spread: 60 }],
      shakeScreen: true,
      flashScreen: { color: '#feca57', duration: 150 },
      sound: '/sounds/lightning.mp3',
    },

    // 治疗技能
    heal: {
      id: 'heal',
      name: '治疗术',
      type: 'heal',
      animation: {
        caster: { scale: 1.15, glow: true, duration: 1000 },
        impact: {
          effect: 'healing_light',
          color: '#2ed573',
          size: 1.5,
          duration: 1200,
        },
        target: { float: true, highlight: '#7bed9f', duration: 1000 },
      },
      particles: [
        { type: 'healing', count: 20, duration: 1500, spread: 60 },
        { type: 'light', count: 10, duration: 1000, spread: 40 },
      ],
      sound: '/sounds/heal.mp3',
    },

    // Buff技能
    power_up: {
      id: 'power_up',
      name: '力量强化',
      type: 'buff',
      animation: {
        caster: { scale: 1.1, glow: true, duration: 800 },
        impact: {
          effect: 'sparkles',
          color: '#ffa502',
          size: 1.3,
          duration: 1000,
        },
        target: { float: true, highlight: '#ff6348', duration: 800 },
      },
      particles: [{ type: 'light', count: 15, duration: 1200, spread: 50 }],
      sound: '/sounds/buff.mp3',
    },

    // 特殊技能
    ultimate_strike: {
      id: 'ultimate_strike',
      name: '终极斩击',
      type: 'special',
      animation: {
        caster: { scale: 1.5, rotation: 360, glow: true, duration: 1200 },
        projectile: {
          type: 'beam',
          color: '#8c7ae6',
          speed: 400,
          trail: true,
        },
        impact: {
          effect: 'explosion',
          color: '#9c88ff',
          size: 3.0,
          duration: 1500,
        },
        target: { shake: true, highlight: '#8c7ae6', duration: 1000 },
      },
      particles: [
        { type: 'lightning', count: 40, duration: 1800, spread: 100 },
        { type: 'light', count: 30, duration: 1500, spread: 80 },
        { type: 'dark', count: 20, duration: 1200, spread: 60 },
      ],
      shakeScreen: true,
      flashScreen: { color: '#8c7ae6', duration: 300 },
      sound: '/sounds/ultimate.mp3',
    },
  };

  // 播放技能动画
  const playSkillAnimation = useCallback((
    skillId: string,
    casterId: number,
    targetId: number,
    options?: {
      damage?: number;
      healing?: number;
      onComplete?: () => void;
    }
  ) => {
    const skillEffect = skillEffects[skillId];
    if (!skillEffect) {
      console.warn(`Skill effect not found: ${skillId}`);
      return;
    }

    const animationItem: AnimationQueueItem = {
      skillEffect,
      casterId,
      targetId,
      damage: options?.damage,
      healing: options?.healing,
      onComplete: options?.onComplete,
    };

    setAnimationQueue(prev => [...prev, animationItem]);
  }, [skillEffects]);

  // 处理动画队列
  useEffect(() => {
    if (animationQueue.length > 0 && !isPlaying) {
      const nextAnimation = animationQueue[0];
      setCurrentAnimation(nextAnimation);
      setAnimationQueue(prev => prev.slice(1));
      setIsPlaying(true);
      executeAnimation(nextAnimation);
    }
  }, [animationQueue, isPlaying]);

  // 执行单个动画
  const executeAnimation = async (animation: AnimationQueueItem) => {
    const { skillEffect, casterId, targetId } = animation;

    trackGameEvent('skill_animation_start', {
      skillId: skillEffect.id,
      casterId,
      targetId,
    });

    try {
      // 播放音效
      if (skillEffect.sound && audioRef.current) {
        audioRef.current.src = skillEffect.sound;
        audioRef.current.play().catch(console.warn);
      }

      // 施法者动画
      await animateCaster(casterId, skillEffect.animation.caster);

      // 投射物动画（如果有）
      if (skillEffect.animation.projectile) {
        await animateProjectile(
          casterId,
          targetId,
          skillEffect.animation.projectile
        );
      }

      // 屏幕震动
      if (skillEffect.shakeScreen) {
        triggerScreenShake();
      }

      // 屏幕闪光
      if (skillEffect.flashScreen) {
        triggerScreenFlash(skillEffect.flashScreen);
      }

      // 撞击效果和目标动画
      await Promise.all([
        animateImpact(targetId, skillEffect.animation.impact),
        animateTarget(targetId, skillEffect.animation.target),
      ]);

      // 粒子效果
      if (skillEffect.particles) {
        triggerParticles(targetId, skillEffect.particles);
      }

      // 显示伤害/治疗数字
      if (animation.damage) {
        showDamageNumber(targetId, animation.damage, 'damage');
      }
      if (animation.healing) {
        showDamageNumber(targetId, animation.healing, 'healing');
      }

    } catch (error) {
      console.error('Animation execution error:', error);
    } finally {
      // 动画完成
      setTimeout(() => {
        setCurrentAnimation(null);
        setIsPlaying(false);
        
        if (animation.onComplete) {
          animation.onComplete();
        }
        
        if (onAnimationComplete) {
          onAnimationComplete(skillEffect.id);
        }

        trackGameEvent('skill_animation_complete', {
          skillId: skillEffect.id,
          casterId,
          targetId,
        });
      }, 500);
    }
  };

  // 施法者动画
  const animateCaster = (casterId: number, casterAnim: SkillAnimation['caster']) => {
    return new Promise<void>((resolve) => {
      const casterElement = document.getElementById(`hero-${casterId}`);
      if (!casterElement) {
        resolve();
        return;
      }

      const animations: any[] = [];

      if (casterAnim.scale) {
        animations.push(
          casterElement.animate([
            { transform: 'scale(1)' },
            { transform: `scale(${casterAnim.scale})` },
            { transform: 'scale(1)' },
          ], {
            duration: casterAnim.duration,
            easing: 'ease-out',
          })
        );
      }

      if (casterAnim.rotation) {
        animations.push(
          casterElement.animate([
            { transform: 'rotate(0deg)' },
            { transform: `rotate(${casterAnim.rotation}deg)` },
          ], {
            duration: casterAnim.duration,
            easing: 'ease-in-out',
          })
        );
      }

      if (casterAnim.glow) {
        casterElement.style.filter = 'drop-shadow(0 0 20px #ffd700)';
        setTimeout(() => {
          casterElement.style.filter = '';
        }, casterAnim.duration);
      }

      if (animations.length > 0) {
        Promise.all(animations.map(anim => anim.finished)).then(() => resolve());
      } else {
        setTimeout(resolve, casterAnim.duration);
      }
    });
  };

  // 投射物动画
  const animateProjectile = (casterId: number, targetId: number, projectile: NonNullable<SkillAnimation['projectile']>) => {
    return new Promise<void>((resolve) => {
      const casterElement = document.getElementById(`hero-${casterId}`);
      const targetElement = document.getElementById(`hero-${targetId}`);
      
      if (!casterElement || !targetElement || !battleFieldRef.current) {
        resolve();
        return;
      }

      const casterRect = casterElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const battleRect = battleFieldRef.current.getBoundingClientRect();

      const startX = casterRect.left + casterRect.width / 2 - battleRect.left;
      const startY = casterRect.top + casterRect.height / 2 - battleRect.top;
      const endX = targetRect.left + targetRect.width / 2 - battleRect.left;
      const endY = targetRect.top + targetRect.height / 2 - battleRect.top;

      const projectileElement = document.createElement('div');
      projectileElement.className = `absolute w-4 h-4 rounded-full ${getProjectileClass(projectile.type)}`;
      projectileElement.style.backgroundColor = projectile.color;
      projectileElement.style.left = `${startX}px`;
      projectileElement.style.top = `${startY}px`;
      projectileElement.style.zIndex = '1000';

      if (projectile.trail) {
        projectileElement.style.boxShadow = `0 0 10px ${projectile.color}`;
      }

      battleFieldRef.current.appendChild(projectileElement);

      const animation = projectileElement.animate([
        { 
          transform: `translate(0, 0)`,
          opacity: 1,
        },
        { 
          transform: `translate(${endX - startX}px, ${endY - startY}px)`,
          opacity: 0.8,
        },
      ], {
        duration: projectile.speed,
        easing: 'ease-out',
      });

      animation.addEventListener('finish', () => {
        projectileElement.remove();
        resolve();
      });
    });
  };

  // 撞击效果动画
  const animateImpact = (targetId: number, impact: SkillAnimation['impact']) => {
    return new Promise<void>((resolve) => {
      const targetElement = document.getElementById(`hero-${targetId}`);
      if (!targetElement || !battleFieldRef.current) {
        resolve();
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const battleRect = battleFieldRef.current.getBoundingClientRect();

      const centerX = targetRect.left + targetRect.width / 2 - battleRect.left;
      const centerY = targetRect.top + targetRect.height / 2 - battleRect.top;

      const impactElement = document.createElement('div');
      impactElement.className = `absolute rounded-full ${getImpactClass(impact.effect)}`;
      impactElement.style.width = `${50 * impact.size}px`;
      impactElement.style.height = `${50 * impact.size}px`;
      impactElement.style.backgroundColor = impact.color;
      impactElement.style.left = `${centerX - (25 * impact.size)}px`;
      impactElement.style.top = `${centerY - (25 * impact.size)}px`;
      impactElement.style.zIndex = '999';

      battleFieldRef.current.appendChild(impactElement);

      const animation = impactElement.animate([
        { 
          transform: 'scale(0)',
          opacity: 1,
        },
        { 
          transform: 'scale(1)',
          opacity: 0.8,
        },
        { 
          transform: 'scale(1.2)',
          opacity: 0,
        },
      ], {
        duration: impact.duration,
        easing: 'ease-out',
      });

      animation.addEventListener('finish', () => {
        impactElement.remove();
        resolve();
      });
    });
  };

  // 目标动画
  const animateTarget = (targetId: number, targetAnim: SkillAnimation['target']) => {
    return new Promise<void>((resolve) => {
      const targetElement = document.getElementById(`hero-${targetId}`);
      if (!targetElement) {
        resolve();
        return;
      }

      const animations: any[] = [];

      if (targetAnim.shake) {
        animations.push(
          targetElement.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-3px)' },
            { transform: 'translateX(3px)' },
            { transform: 'translateX(0)' },
          ], {
            duration: targetAnim.duration,
            easing: 'ease-out',
          })
        );
      }

      if (targetAnim.float) {
        animations.push(
          targetElement.animate([
            { transform: 'translateY(0)' },
            { transform: 'translateY(-10px)' },
            { transform: 'translateY(0)' },
          ], {
            duration: targetAnim.duration,
            easing: 'ease-in-out',
          })
        );
      }

      if (targetAnim.highlight) {
        targetElement.style.filter = `drop-shadow(0 0 15px ${targetAnim.highlight})`;
        setTimeout(() => {
          targetElement.style.filter = '';
        }, targetAnim.duration);
      }

      if (animations.length > 0) {
        Promise.all(animations.map(anim => anim.finished)).then(() => resolve());
      } else {
        setTimeout(resolve, targetAnim.duration);
      }
    });
  };

  // 屏幕震动
  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  // 屏幕闪光
  const triggerScreenFlash = (flash: { color: string; duration: number }) => {
    setScreenFlash({ color: flash.color, opacity: 0.3 });
    setTimeout(() => setScreenFlash(null), flash.duration);
  };

  // 粒子效果
  const triggerParticles = (targetId: number, particleEffects: ParticleEffect[]) => {
    particleEffects.forEach((effect, index) => {
      setTimeout(() => {
        const particleId = `${targetId}-${effect.type}-${Date.now()}-${index}`;
        const newParticles = Array.from({ length: effect.count }, (_, i) => ({
          id: `${particleId}-${i}`,
          type: effect.type,
          x: Math.random() * effect.spread,
          y: Math.random() * effect.spread,
          life: 1,
        }));

        setParticles(prev => ({
          ...prev,
          [particleId]: newParticles,
        }));

        setTimeout(() => {
          setParticles(prev => {
            const updated = { ...prev };
            delete updated[particleId];
            return updated;
          });
        }, effect.duration);
      }, index * 100);
    });
  };

  // 显示伤害数字
  const showDamageNumber = (targetId: number, value: number, type: 'damage' | 'healing') => {
    const targetElement = document.getElementById(`hero-${targetId}`);
    if (!targetElement || !battleFieldRef.current) return;

    const targetRect = targetElement.getBoundingClientRect();
    const battleRect = battleFieldRef.current.getBoundingClientRect();

    const numberElement = document.createElement('div');
    numberElement.className = `absolute font-bold text-xl z-50 pointer-events-none ${
      type === 'damage' ? 'text-red-400' : 'text-green-400'
    }`;
    numberElement.textContent = type === 'damage' ? `-${value}` : `+${value}`;
    numberElement.style.left = `${targetRect.left + targetRect.width / 2 - battleRect.left}px`;
    numberElement.style.top = `${targetRect.top - battleRect.top}px`;
    numberElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';

    battleFieldRef.current.appendChild(numberElement);

    const animation = numberElement.animate([
      { 
        transform: 'translateY(0) scale(1)',
        opacity: 1,
      },
      { 
        transform: 'translateY(-50px) scale(1.2)',
        opacity: 0,
      },
    ], {
      duration: 1500,
      easing: 'ease-out',
    });

    animation.addEventListener('finish', () => {
      numberElement.remove();
    });
  };

  // 获取投射物样式类
  const getProjectileClass = (type: string) => {
    const classes = {
      beam: 'bg-gradient-to-r',
      orb: 'rounded-full shadow-lg',
      arrow: 'transform rotate-45',
      lightning: 'bg-gradient-to-r opacity-80',
    };
    return classes[type as keyof typeof classes] || '';
  };

  // 获取撞击效果样式类
  const getImpactClass = (effect: string) => {
    const classes = {
      explosion: 'shadow-2xl',
      sparkles: 'animate-pulse',
      shockwave: 'border-4 border-white',
      healing_light: 'shadow-lg animate-pulse',
    };
    return classes[effect as keyof typeof classes] || '';
  };

  // 暴露给外部的API
  React.useImperativeHandle(ref, () => ({
    playAnimation: (effect: SkillEffect, casterId: number, targetId: number) => {
      console.log('Playing animation:', effect, casterId, targetId);
      // 简化实现，避免复杂的依赖
      setAnimationQueue(prev => [...prev, {
        skillEffect: effect,
        casterId,
        targetId,
      }]);
    },
    clearQueue: () => {
      setAnimationQueue([]);
      setCurrentAnimation(null);
      setIsPlaying(false);
    },
    isPlaying,
  }));

  return (
    <>
      {/* 音频元素 */}
      <audio ref={audioRef} preload="none" />

      {/* 屏幕效果 */}
      <AnimatePresence>
        {screenShake && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            animate={{
              x: [0, -2, 2, -2, 2, 0],
              y: [0, -1, 1, -1, 1, 0],
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}

        {screenFlash && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            style={{ backgroundColor: screenFlash.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: screenFlash.opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      {/* 粒子系统 */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {Object.entries(particles).map(([groupId, particleGroup]) =>
          particleGroup.map(particle => (
            <motion.div
              key={particle.id}
              className={`absolute w-2 h-2 rounded-full ${getParticleClass(particle.type)}`}
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [1, 0.8, 0],
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{ 
                duration: 1 + Math.random(),
                ease: "easeOut"
              }}
            />
          ))
        )}
      </div>
    </>
  );
});

// 获取粒子样式类
const getParticleClass = (type: string) => {
  const classes = {
    fire: 'bg-gradient-to-r from-red-500 to-orange-500',
    ice: 'bg-gradient-to-r from-blue-300 to-cyan-400',
    lightning: 'bg-gradient-to-r from-yellow-300 to-yellow-500',
    healing: 'bg-gradient-to-r from-green-400 to-emerald-500',
    dark: 'bg-gradient-to-r from-purple-800 to-black',
    light: 'bg-gradient-to-r from-white to-yellow-200',
  };
  return classes[type as keyof typeof classes] || 'bg-gray-400';
};

export default SkillAnimationSystem;
export type { SkillEffect, AnimationQueueItem };