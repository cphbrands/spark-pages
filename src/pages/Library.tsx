import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreVertical, Download, Trash2, Edit, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Mock media data
const mockMedia = [
  {
    id: '1',
    title: 'Hair Dryer Talk',
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
    type: 'video',
    source: 'Sora 2',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Hair Dryer Review',
    thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    type: 'video',
    source: 'Sora 2',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    title: 'Product Demo',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    type: 'video',
    source: 'AI Generated',
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    title: 'Landing Hero',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    type: 'image',
    source: 'Uploaded',
    createdAt: '2024-01-12',
  },
];

const exploreMedia = [
  {
    id: 'e1',
    title: 'Modern Office',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    type: 'image',
    source: 'Stock',
    createdAt: '2024-01-10',
  },
  {
    id: 'e2',
    title: 'Team Meeting',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    type: 'image',
    source: 'Stock',
    createdAt: '2024-01-09',
  },
  {
    id: 'e3',
    title: 'Tech Abstract',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    type: 'image',
    source: 'Stock',
    createdAt: '2024-01-08',
  },
];

interface MediaCardProps {
  item: typeof mockMedia[0];
  showSkeleton?: boolean;
}

function MediaCard({ item, showSkeleton }: MediaCardProps) {
  if (showSkeleton) {
    return (
      <div className="group">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="mt-2 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        
        {/* Kebab menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border z-50">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Type badge */}
        <div className="absolute bottom-2 left-2">
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-md",
            item.type === 'video' ? "bg-purple-500/90 text-white" : "bg-blue-500/90 text-white"
          )}>
            {item.type}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Globe className="w-3 h-3" />
          {item.source}
        </div>
      </div>
    </div>
  );
}

export default function Library() {
  const [activeTab, setActiveTab] = useState('my-media');
  const [filter, setFilter] = useState('all');
  const [isLoading] = useState(false);

  const currentMedia = activeTab === 'my-media' ? mockMedia : exploreMedia;
  const filteredMedia = filter === 'all' 
    ? currentMedia 
    : currentMedia.filter(m => m.type === filter);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create anything with AI</h1>
          <p className="text-muted-foreground">
            Realistic images and cinematic videos — from a single prompt
          </p>
        </div>

        {/* Tabs + Filter */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted">
              <TabsTrigger value="explore">Explore</TabsTrigger>
              <TabsTrigger value="my-media">
                My media
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                  {mockMedia.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="all">All Media</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="image">Images</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MediaCard key={i} item={mockMedia[0]} showSkeleton />
              ))
            : filteredMedia.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))
          }
        </div>

        {filteredMedia.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No media found</p>
          </div>
        )}

        {/* AI Prompt Input */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4">
            <Input
              placeholder="Describe the video you want to create..."
              className="border-0 bg-transparent text-lg focus-visible:ring-0 px-0"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  Video
                </Button>
                <Button variant="ghost" size="sm">
                  Image
                  <span className="ml-1 text-xs text-primary">NEW</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="sora2">
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="sora2">Sora 2</SelectItem>
                    <SelectItem value="dalle">DALL-E</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="16:9">
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="9:16">9:16</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" disabled>
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
