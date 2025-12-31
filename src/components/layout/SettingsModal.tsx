import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  User,
  Settings,
  CreditCard,
  Users,
  Image,
  Globe,
} from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const settingsSections = [
  { id: 'account', label: 'Account info', icon: User, group: 'User settings' },
  { id: 'preferences', label: 'Preferences', icon: Settings, group: 'User settings' },
  { id: 'general', label: 'General', icon: Settings, group: 'Workspace settings' },
  { id: 'publishing', label: 'Publishing', icon: Globe, group: 'Workspace settings', badge: true },
  { id: 'billing', label: 'Billing', icon: CreditCard, group: 'Workspace settings' },
  { id: 'users', label: 'Users', icon: Users, group: 'Workspace settings', badge: true },
];

interface SettingToggleProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
}

function SettingToggle({ title, description, defaultChecked }: SettingToggleProps) {
  const [checked, setChecked] = useState(defaultChecked ?? true);
  
  return (
    <div className="flex items-start justify-between py-4 border-b border-border last:border-0">
      <div className="flex-1 pr-4">
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState('general');

  const groupedSections = settingsSections.reduce((acc, section) => {
    if (!acc[section.group]) acc[section.group] = [];
    acc[section.group].push(section);
    return acc;
  }, {} as Record<string, typeof settingsSections>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0 bg-background border-border">
        <div className="flex h-full">
          {/* Left Navigation */}
          <div className="w-56 border-r border-border p-4 flex flex-col gap-6">
            {Object.entries(groupedSections).map(([group, sections]) => (
              <div key={group}>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Button
                        key={section.id}
                        variant="ghost"
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full justify-start gap-2 px-2 font-normal",
                          activeSection === section.id
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                        {section.badge && (
                          <span className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-semibold">
                {activeSection === 'general' ? 'Name and icon' : 
                 settingsSections.find(s => s.id === activeSection)?.label}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-6">
              {activeSection === 'general' && (
                <div className="space-y-6">
                  {/* Workspace Icon */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Workspace icon</Label>
                    <div className="mt-2">
                      <Button variant="outline" className="w-16 h-16 border-dashed">
                        <Image className="w-6 h-6 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {/* Workspace Name */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Workspace name</Label>
                    <Input 
                      defaultValue="Workspace" 
                      className="mt-2 max-w-md"
                    />
                  </div>

                  {/* Feature settings */}
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold mb-4">Feature settings</h3>
                    <div className="divide-y divide-border">
                      <SettingToggle
                        title="Page analytics"
                        description="Enables capturing of analytics on all published pages."
                        defaultChecked={true}
                      />
                      <SettingToggle
                        title="AI screen recorder"
                        description="Members of the workspace need to install browser extension to add screen recordings."
                        defaultChecked={true}
                      />
                      <SettingToggle
                        title="AI Content Generation"
                        description="Enables AI content generation features for all workspace members."
                        defaultChecked={true}
                      />
                      <SettingToggle
                        title="AI Translation Engine"
                        description="Enables AI translation engine features for all workspace members."
                        defaultChecked={true}
                      />
                      <SettingToggle
                        title="Advanced personalization"
                        description="Enable advanced visitor targeting and personalization rules."
                        defaultChecked={false}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'account' && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-muted-foreground">Full name</Label>
                    <Input defaultValue="Hello User" className="mt-2 max-w-md" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email address</Label>
                    <Input defaultValue="user@example.com" className="mt-2 max-w-md" />
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-4">
                  <SettingToggle
                    title="Dark mode"
                    description="Use dark theme across the application."
                    defaultChecked={true}
                  />
                  <SettingToggle
                    title="Email notifications"
                    description="Receive email notifications for important updates."
                    defaultChecked={true}
                  />
                  <SettingToggle
                    title="Marketing emails"
                    description="Receive tips, tutorials, and product updates."
                    defaultChecked={false}
                  />
                </div>
              )}

              {(activeSection === 'publishing' || activeSection === 'billing' || activeSection === 'users') && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>This section is coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
