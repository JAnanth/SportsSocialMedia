import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { usersService } from '../services/usersService';

const UserProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
    loadUserPosts();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const userData = await usersService.getUserProfile(userId);
      setUser(userData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const postsData = await usersService.getUserPosts(userId);
      setPosts(postsData);
    } catch (error) {
      console.error('Load posts error:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (user.is_following) {
        await usersService.unfollowUser(userId);
        setUser({ ...user, is_following: false, follower_count: user.follower_count - 1 });
      } else {
        await usersService.followUser(userId);
        setUser({ ...user, is_following: true, follower_count: user.follower_count + 1 });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.username?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        {user.hometown && <Text style={styles.hometown}>{user.hometown}</Text>}
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.follower_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.followButton, user.is_following && styles.followingButton]}
          onPress={handleFollowToggle}
        >
          <Text style={[styles.followButtonText, user.is_following && styles.followingButtonText]}>
            {user.is_following ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Teams</Text>
        {user.favorite_teams?.map((team) => (
          <View key={team.team_id} style={styles.teamCard}>
            <Text style={styles.teamName}>{team.team_name}</Text>
            <View style={styles.teamStats}>
              <Text style={styles.teamStat}>Reputation: {team.quality_score || 0}</Text>
              <Text style={styles.teamStat}>{'⭐'.repeat(team.fandom_level)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posts</Text>
        {posts.length === 0 ? (
          <Text style={styles.emptyText}>No posts yet</Text>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postContent} numberOfLines={3}>
                {post.content}
              </Text>
              <Text style={styles.postMeta}>
                {new Date(post.created_at).toLocaleDateString()} • {post.team_name}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  hometown: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  followButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  teamCard: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamStat: {
    fontSize: 14,
    color: '#666',
  },
  postCard: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  postMeta: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});

export default UserProfileScreen;
