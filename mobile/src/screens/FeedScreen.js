import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { postsService } from '../services/postsService';
import { teamsService } from '../services/teamsService';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const FeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadUserTeams();
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      loadPosts();
    }
  }, [selectedTeamId, teams]);

  const loadUserTeams = async () => {
    try {
      const userTeams = await teamsService.getUserFavoriteTeams();
      setTeams(userTeams);
      if (userTeams.length > 0) {
        setSelectedTeamId(userTeams[0].id);
      }
    } catch (error) {
      console.error('Load teams error:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const params = selectedTeamId ? { teamId: selectedTeamId } : {};
      const postsData = await postsService.getFeed(params);
      setPosts(postsData);
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts();
  }, [selectedTeamId]);

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const handleVote = async (postId, voteType) => {
    try {
      await postsService.votePost(postId, voteType);
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          const oldVote = post.user_vote || 0;
          const upvoteDelta = (voteType === 1 ? 1 : 0) - (oldVote === 1 ? 1 : 0);
          const downvoteDelta = (voteType === -1 ? 1 : 0) - (oldVote === -1 ? 1 : 0);

          return {
            ...post,
            upvotes: post.upvotes + upvoteDelta,
            downvotes: post.downvotes + downvoteDelta,
            user_vote: voteType,
          };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Feed</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost', { teamId: selectedTeamId })}
      >
        <Text style={styles.createButtonText}>+ Post</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTeamSelector = () => (
    <View style={styles.teamSelector}>
      <TouchableOpacity
        style={[styles.teamChip, !selectedTeamId && styles.teamChipActive]}
        onPress={() => setSelectedTeamId(null)}
      >
        <Text style={[styles.teamChipText, !selectedTeamId && styles.teamChipTextActive]}>
          All Teams
        </Text>
      </TouchableOpacity>
      {teams.map((team) => (
        <TouchableOpacity
          key={team.id}
          style={[styles.teamChip, selectedTeamId === team.id && styles.teamChipActive]}
          onPress={() => setSelectedTeamId(team.id)}
        >
          <Text style={[styles.teamChipText, selectedTeamId === team.id && styles.teamChipTextActive]}>
            {team.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTeamSelector()}
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => handlePostPress(item)}
            onVote={handleVote}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to post!</Text>
          </View>
        }
      />
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  teamSelector: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  teamChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  teamChipActive: {
    backgroundColor: '#007AFF',
  },
  teamChipText: {
    fontSize: 14,
    color: '#666',
  },
  teamChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default FeedScreen;
