import { Shield, Lock, Zap } from 'lucide-react';
import { Card } from './ui/card';

const features = [
  {
    name: 'Blockchain Security',
    description: 'Leverage the power of blockchain for immutable and transparent file tracking.',
    icon: Shield,
  },
  {
    name: 'IPFS Storage',
    description: 'Distributed file storage using IPFS ensures high availability and censorship resistance.',
    icon: Lock,
  },
  {
    name: 'Auto Compensation',
    description: 'With our advanced technology, you can enjoy automatic compensation for shared files.',
    icon: Zap,
  },
];

export function Features() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-md font-normal uppercase leading-7 text-cyan-600 dark:text-cyan-300">
            Advanced Technology
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-4xl">
            Everything you need for secure file sharing
          </h3>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Our platform combines cutting-edge technologies to provide you with the most secure and efficient file
            sharing experience.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature) => (
              <Card
                key={feature.name}
                className="relative pl-16 py-2 border border-gray-200 dark:border-cyan-900 dark:shadow-xl dark:shadow-cyan-500/10 rounded overflow-hidden"
              >
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center bg-cyan-600 rounded-tl-none rounded">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
              </Card>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
