import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Rating,
  IconButton,
  Tooltip,
  Stack,
  Grid,
} from '@mui/material';
import {
  Shield,
  SportsMartialArts,
  Favorite,
  Speed,
  Star,
  Person,
  FavoriteBorder,
  EmojiEvents,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Hero } from '../../types';
import { getQualityColor, getQualityGradient, getQualityGlow, getQualityAnimation } from '../../utils/qualityColors';

interface HeroCardProps {
  hero: Hero;
  onClick?: (hero: Hero) => void;
  isSelected?: boolean;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({
  hero,
  onClick,
  isSelected = false,
  showStats = true,
  size = 'md',
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(hero);
    }
  };

  const getFactionColor = (faction: string) => {
    switch (faction) {
      case '蜀':
        return 'shu';
      case '魏':
        return 'wei';
      case '吴':
        return 'wu';
      default:
        return 'primary';
    }
  };

  const quality = hero.rarity || hero.quality || 1;
  const rarityColor = getQualityColor(quality);
  const rarityGradient = getQualityGradient(quality);
  const rarityGlow = getQualityGlow(quality);
  const rarityAnimation = getQualityAnimation(quality);

  const cardHeight = {
    sm: 240,   // 手机端适配：减小高度
    md: 280,   // 平板端
    lg: 320,   // 桌面端
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          height: cardHeight,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          boxShadow: isSelected ? 4 : 2,
          background: `linear-gradient(135deg, 
            ${rarityColor}15 0%, 
            transparent 50%
          ), linear-gradient(to bottom right, #1f2937, #111827)`,
          animation: rarityAnimation ? `${rarityAnimation} 2s ease-in-out infinite` : 'none',
          '&:hover': {
            boxShadow: 6,
            '& .hero-glow': {
              opacity: 1,
            },
          },
        }}
        onClick={handleClick}
      >
        {/* 背景光效 */}
        <Box
          className="hero-glow"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at center, ${rarityColor}20 0%, transparent 70%)`,
            boxShadow: quality >= 5 ? rarityGlow : 'none',
            opacity: 0,
            transition: 'opacity 0.3s',
            zIndex: 0,
          }}
        />

        {/* 英雄头像/背景 */}
        {hero.card_image ? (
          <CardMedia
            component="img"
            sx={{
              height: '60%',
              objectFit: 'cover',
              position: 'relative',
            }}
            image={hero.card_image}
            alt={hero.name}
          />
        ) : (
          <Box
            sx={{
              height: '60%',
              background: 'linear-gradient(135deg, #374151, #1f2937)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: getFactionColor(hero.faction) + '.main',
                fontSize: '2rem',
              }}
            >
              <Person fontSize="large" />
            </Avatar>
          </Box>
        )}

        {/* 等级标签 */}
        <Chip
          label={`Lv.${hero.level}`}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 2,
          }}
        />

        {/* 稀有度星级 */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
          }}
        >
          <Rating
            value={quality}
            readOnly
            max={6}
            size="small"
            icon={<Star fontSize="inherit" sx={{ color: '#ffd700' }} />}
            emptyIcon={<Star fontSize="inherit" sx={{ color: '#555' }} />}
          />
        </Box>

        {/* 阵营标签 */}
        <Chip
          label={hero.faction}
          size="small"
          color={getFactionColor(hero.faction) as any}
          sx={{
            position: 'absolute',
            top: 40,
            left: 8,
            fontWeight: 'bold',
            zIndex: 2,
          }}
        />

        {/* 收藏图标 */}
        {hero.isFavorite && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 40,
              right: 8,
              color: '#ff6b35',
              zIndex: 2,
            }}
          >
            <Favorite fontSize="small" />
          </IconButton>
        )}

        <CardContent
          sx={{
            height: '40%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1.5,
            '&:last-child': { pb: 1.5 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* 英雄信息 */}
          <Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 'bold',
                fontSize: size === 'sm' ? '0.9rem' : '1rem',
                color: quality >= 5 ? 'gold.main' : 'text.primary',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                mb: 0.5,
                lineHeight: 1.2,
              }}
              noWrap
            >
              {hero.name}
            </Typography>

            {hero.title && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1,
                }}
                noWrap
              >
                {hero.title}
              </Typography>
            )}

            {/* 显示战力或角色信息 */}
            {hero.power ? (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                <EmojiEvents sx={{ fontSize: '0.875rem', color: '#ffd700' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#ffd700',
                    fontWeight: 'bold',
                  }}
                >
                  战力: {hero.power}
                </Typography>
              </Stack>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1,
                }}
              >
                {hero.role} · {hero.unit_type}
              </Typography>
            )}
          </Box>

          {/* 属性显示 */}
          {showStats && (
            <Grid container spacing={0.5} sx={{ mt: 'auto' }}>
              <Grid item xs={6}>
                <Tooltip title="攻击力">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <SportsMartialArts sx={{ fontSize: '0.875rem', color: 'error.main' }} />
                    <Typography variant="caption" fontWeight="bold">
                      {hero.attack}
                    </Typography>
                  </Stack>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="防御力">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Shield sx={{ fontSize: '0.875rem', color: 'info.main' }} />
                    <Typography variant="caption" fontWeight="bold">
                      {hero.defense}
                    </Typography>
                  </Stack>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="生命值">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Favorite sx={{ fontSize: '0.875rem', color: 'success.main' }} />
                    <Typography variant="caption" fontWeight="bold">
                      {hero.health}
                    </Typography>
                  </Stack>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Tooltip title="速度">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Speed sx={{ fontSize: '0.875rem', color: 'warning.main' }} />
                    <Typography variant="caption" fontWeight="bold">
                      {hero.speed}
                    </Typography>
                  </Stack>
                </Tooltip>
              </Grid>
            </Grid>
          )}
        </CardContent>

        {/* 选中效果 */}
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              border: 2,
              borderColor: 'primary.main',
              borderRadius: 1,
              boxShadow: `0 0 20px ${rarityColor}80, ${rarityGlow}`,
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default HeroCard;