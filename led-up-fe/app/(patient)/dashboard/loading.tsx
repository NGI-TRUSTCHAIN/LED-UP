import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Activity, ChartBar, Eye, FileText, Share2, Sparkles } from 'lucide-react';

export default function Loading() {
  // Mock stats for loading state
  const loadingStats = [
    {
      title: 'Loading Stat 1',
      icon: FileText,
      gradient: 'from-primary/50 to-primary',
      darkGradient: 'dark:from-primary dark:to-primary/50',
      ringColor: 'ring-primary/50',
      iconColor: 'text-primary dark:text-primary-foreground',
    },
    {
      title: 'Loading Stat 2',
      icon: Share2,
      gradient: 'from-emerald-500/50 to-emerald-500',
      darkGradient: 'dark:from-emerald-500 dark:to-emerald-500/50',
      ringColor: 'ring-emerald-500/50',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      title: 'Loading Stat 3',
      icon: Eye,
      gradient: 'from-violet-500/50 to-violet-500',
      darkGradient: 'dark:from-violet-500 dark:to-violet-500/50',
      ringColor: 'ring-violet-500/50',
      iconColor: 'text-violet-500 dark:text-violet-400',
    },
    {
      title: 'Loading Stat 4',
      icon: ChartBar,
      gradient: 'from-amber-500/50 to-amber-500',
      darkGradient: 'dark:from-amber-500 dark:to-amber-500/50',
      ringColor: 'ring-amber-500/50',
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
  ];

  return (
    <main className="container max-w-7xl mx-auto py-6 space-y-8 relative mb-12">
      {/* Header Section with Gradient Background */}
      <Card className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-8 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30 mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="space-y-2">
              {/* Loading title */}
              <div className="h-8 w-64 bg-primary/20 rounded-lg animate-pulse"></div>
              {/* Loading subtitle */}
              <div className="h-4 w-48 bg-primary/20 rounded-lg animate-pulse"></div>
            </div>
            <div className="mt-4 sm:mt-0">
              {/* Loading button */}
              <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} ${stat.darkGradient} opacity-10`}
            ></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                </div>
                <div
                  className={`p-3 rounded-full bg-background/80 backdrop-blur-sm ring-2 ring-offset-2 ${stat.ringColor}`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Records Loading Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Loading Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2"></div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log Loading Card */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2"></div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start p-3 rounded-lg bg-muted/50 animate-pulse">
                <div className="w-10 h-10 bg-primary/10 rounded-lg"></div>
                <div className="ml-3 space-y-2 flex-1">
                  <div className="h-4 w-48 bg-muted rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
