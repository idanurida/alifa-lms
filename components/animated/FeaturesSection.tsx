'use client';

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesSectionProps {
  features: FeatureItem[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div key={index} className="p-6 border rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{feature.icon}</span>
            </div>
            <h3 className="font-semibold text-lg">{feature.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
