import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'campaign' | 'message' | 'system';
  time: string;
  unread: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Subscribe to real-time changes for campaigns and message logs
    const campaignsSubscription = supabase
      .channel('campaigns-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaigns',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newCampaign = payload.new;
          const notification: Notification = {
            id: `campaign-${newCampaign.id}`,
            title: 'New Campaign Created',
            message: `Your ${newCampaign.type.replace('_', ' ')} campaign "${newCampaign.name}" is now ${newCampaign.status}`,
            type: 'campaign',
            time: getRelativeTime(newCampaign.created_at),
            unread: true,
            created_at: newCampaign.created_at,
          };
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_logs',
        },
        async (payload: any) => {
          const newLog = payload.new;
          
          // Verify this message belongs to user's campaign
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('name, user_id')
            .eq('id', newLog.campaign_id)
            .single();

          if (campaign && campaign.user_id === user.id) {
            const { data: customer } = await supabase
              .from('customers')
              .select('name')
              .eq('id', newLog.customer_id)
              .single();

            const notification: Notification = {
              id: `message-${newLog.id}`,
              title: 'Message Delivered',
              message: `Customer ${customer?.name || 'Unknown'} received your message from "${campaign.name}"`,
              type: 'message',
              time: getRelativeTime(newLog.sent_at),
              unread: true,
              created_at: newLog.sent_at,
            };
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      campaignsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch recent campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent message logs
      const { data: messageLogs } = await supabase
        .from('message_logs')
        .select(`
          id,
          sent_at,
          delivery_status,
          customer_id,
          campaign_id,
          customers (name),
          campaigns (name, user_id)
        `)
        .eq('campaigns.user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5);

      const notificationsList: Notification[] = [];

      // Convert campaigns to notifications
      campaigns?.forEach((campaign: any) => {
        notificationsList.push({
          id: `campaign-${campaign.id}`,
          title: 'Campaign Created',
          message: `Your ${campaign.type.replace('_', ' ')} campaign "${campaign.name}" is ${campaign.status}`,
          type: 'campaign',
          time: getRelativeTime(campaign.created_at),
          unread: false, // Mark existing as read
          created_at: campaign.created_at,
        });
      });

      // Convert message logs to notifications
      messageLogs?.forEach((log: any) => {
        if (log.campaigns?.user_id === user.id) {
          notificationsList.push({
            id: `message-${log.id}`,
            title: log.delivery_status === 'delivered' ? 'Message Delivered' : 'Message Sent',
            message: `Customer ${log.customers?.name || 'Unknown'} received your message`,
            type: 'message',
            time: getRelativeTime(log.sent_at),
            unread: false,
            created_at: log.sent_at,
          });
        }
      });

      // Sort by created_at descending
      notificationsList.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(notificationsList.slice(0, 10));
      setUnreadCount(0); // Start with 0, real-time updates will increment
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    );
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAllAsRead,
    markAsRead,
    refetch: fetchNotifications,
  };
}

// Helper function to get relative time
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
}
