"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Check, X, MessageSquare, Users, Clock, Sparkles } from 'lucide-react';
import { Button, Card, Avatar, Badge, EmptyState, PageHeader, LoadingSpinner } from '@/components/ui';
import { getConnections, getPendingRequests, getConnectionSuggestions, acceptRequest, rejectRequest, sendConnectionRequest, removeConnection, Connection, ConnectionRequest, ConnectionSuggestion } from '@/src/api/connections';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'suggestions'>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [connData, reqData, sugData] = await Promise.all([
          getConnections(),
          getPendingRequests(),
          getConnectionSuggestions(),
        ]);
        setConnections(connData.items);
        setPendingRequests(reqData);
        setSuggestions(sugData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      const newConnection = await acceptRequest(requestId);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setConnections(prev => [...prev, newConnection]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async (connectionId: string) => {
    try {
      await removeConnection(connectionId);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredConnections = connections.filter(c =>
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'connections', label: 'My Connections', icon: Users, count: connections.length },
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingRequests.length },
    { id: 'suggestions', label: 'Suggestions', icon: Sparkles, count: suggestions.length },
  ] as const;

  if (loading) return <LoadingSpinner fullScreen text="Loading connections..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Connections" subtitle="Manage your alumni network" />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-[#001145] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-[#001145]/10'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search (for connections tab) */}
      {activeTab === 'connections' && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#001145]/20 focus:border-[#001145]"
          />
        </div>
      )}

      {/* My Connections */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnections.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={Users} title="No connections yet" description="Start connecting with fellow alumni" />
            </div>
          ) : (
            filteredConnections.map((conn) => (
              <Card key={conn.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar name={conn.user.name} src={conn.user.avatarUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${conn.user.id}`} className="font-bold text-[#001145] hover:underline block truncate">
                      {conn.user.name}
                    </Link>
                    <p className="text-gray-600 text-sm truncate">{conn.user.currentRole}</p>
                    <p className="text-gray-500 text-sm truncate">{conn.user.currentCompany}</p>
                    {conn.user.gradYear && <Badge size="sm" className="mt-2">{conn.user.gradYear}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link href={`/messages?user=${conn.user.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<MessageSquare size={14} />}>Message</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(conn.id)} className="text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pending Requests */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <EmptyState icon={Clock} title="No pending requests" description="You're all caught up!" />
          ) : (
            pendingRequests.map((req) => (
              <Card key={req.id}>
                <div className="flex items-center gap-4">
                  <Avatar name={req.from.name} src={req.from.avatarUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${req.from.id}`} className="font-bold text-[#001145] hover:underline">
                      {req.from.name}
                    </Link>
                    <p className="text-gray-600 text-sm">{req.from.currentRole} at {req.from.currentCompany}</p>
                    {req.message && <p className="text-gray-500 text-sm mt-1 italic">&quot;{req.message}&quot;</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" leftIcon={<Check size={14} />} onClick={() => handleAccept(req.id)}>Accept</Button>
                    <Button variant="outline" size="sm" onClick={() => handleReject(req.id)}><X size={14} /></Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={Sparkles} title="No suggestions" description="Check back later for new suggestions" />
            </div>
          ) : (
            suggestions.map((sug) => (
              <Card key={sug.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar name={sug.name} src={sug.avatarUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${sug.id}`} className="font-bold text-[#001145] hover:underline block truncate">
                      {sug.name}
                    </Link>
                    <p className="text-gray-600 text-sm truncate">{sug.currentRole}</p>
                    <p className="text-gray-500 text-sm truncate">{sug.currentCompany}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge size="sm" variant="info">{sug.mutualConnections} mutual</Badge>
                      <span className="text-xs text-gray-500">{sug.reason}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm" leftIcon={<UserPlus size={14} />} onClick={() => handleConnect(sug.id)}>
                  Connect
                </Button>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
