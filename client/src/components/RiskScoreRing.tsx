/**
 * RiskScoreRing Component
 * Circular progress indicator showing meter risk level (0-100%)
 * Design: SVG-based ring with gradient coloring based on risk level
 */

interface RiskScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function RiskScoreRing({ score, size = 'md', showLabel = true }: RiskScoreRingProps) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Determine color based on risk level
  const getColor = (score: number) => {
    if (score < 30) return '#10B981'; // Green - Low risk
    if (score < 60) return '#F59E0B'; // Orange - Medium risk
    return '#EF4444'; // Red - High risk
  };

  const getTextColor = (score: number) => {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const sizeConfig = {
    sm: { size: 60, strokeWidth: 4, fontSize: 12 },
    md: { size: 80, strokeWidth: 5, fontSize: 16 },
    lg: { size: 120, strokeWidth: 6, fontSize: 20 },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  const color = getColor(normalizedScore);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={config.size} height={config.size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="#334155"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-${config.fontSize === 12 ? 'xs' : config.fontSize === 16 ? 'sm' : 'lg'} font-bold ${getTextColor(normalizedScore)}`}>
              {normalizedScore}%
            </div>
            {showLabel && (
              <div className="text-xs text-muted-foreground mt-0.5">Risk</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
