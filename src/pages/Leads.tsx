import { useBuilderStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Download,
  Filter,
  Users,
  Layout,
  Sparkles,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function Leads() {
  const navigate = useNavigate();
  const { leads, pages } = useBuilderStore();
  const [filterPageId, setFilterPageId] = useState<string>('all');

  const filteredLeads = filterPageId === 'all' 
    ? leads 
    : leads.filter(lead => lead.pageId === filterPageId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Page', 'Date'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.pageSlug,
      new Date(lead.createdAt).toISOString(),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-builder-bg">
      {/* Header */}
      <header className="border-b border-builder-border bg-builder-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-builder-text">PageCraft</h1>
          </div>
          
          <nav className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-builder-text-muted hover:text-builder-text hover:bg-builder-surface-hover"
              onClick={() => navigate('/builder')}
            >
              <Layout className="w-4 h-4 mr-2" />
              Pages
            </Button>
            <Button 
              variant="ghost" 
              className="text-builder-text hover:bg-builder-surface-hover bg-builder-surface-hover"
              onClick={() => navigate('/builder/leads')}
            >
              <Users className="w-4 h-4 mr-2" />
              Leads
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-builder-text mb-2">Lead Submissions</h2>
            <p className="text-builder-text-muted">
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} captured
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={filterPageId} onValueChange={setFilterPageId}>
              <SelectTrigger className="w-48 bg-builder-surface border-builder-border text-builder-text">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by page" />
              </SelectTrigger>
              <SelectContent className="bg-builder-surface border-builder-border">
                <SelectItem value="all" className="text-builder-text">All Pages</SelectItem>
                {pages.map(page => (
                  <SelectItem key={page.id} value={page.id} className="text-builder-text">
                    {page.meta.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={exportCSV}
              disabled={filteredLeads.length === 0}
              className="border-builder-border text-builder-text hover:bg-builder-surface-hover"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="builder-panel p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-builder-surface-hover flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-builder-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-builder-text mb-2">No leads yet</h3>
            <p className="text-builder-text-muted">
              Leads will appear here when visitors submit forms on your landing pages
            </p>
          </div>
        ) : (
          <div className="builder-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-builder-border">
                    <th className="text-left p-4 text-builder-text-muted font-medium">Name</th>
                    <th className="text-left p-4 text-builder-text-muted font-medium">Email</th>
                    <th className="text-left p-4 text-builder-text-muted font-medium">Phone</th>
                    <th className="text-left p-4 text-builder-text-muted font-medium">Page</th>
                    <th className="text-left p-4 text-builder-text-muted font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b border-builder-border/50 hover:bg-builder-surface-hover/50">
                      <td className="p-4 text-builder-text font-medium">{lead.name}</td>
                      <td className="p-4">
                        <a 
                          href={`mailto:${lead.email}`} 
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </a>
                      </td>
                      <td className="p-4 text-builder-text-muted">
                        {lead.phone ? (
                          <a 
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-2 hover:text-builder-text"
                          >
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-builder-bg rounded text-sm text-builder-text">
                          /{lead.pageSlug}
                        </span>
                      </td>
                      <td className="p-4 text-builder-text-muted flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
