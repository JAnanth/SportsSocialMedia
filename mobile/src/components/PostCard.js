import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PostCard = ({ post, onPress, onVote }) => {
  const handleUpvote = () => {
    const newVote = post.user_vote === 1 ? 0 : 1;
    onVote(post.id, newVote);
  };

  const handleDownvote = () => {
    const newVote = post.user_vote === -1 ? 0 : -1;
    onVote(post.id, newVote);
  };

  const getVoteColor = (voteType) => {
    if (post.user_vote === voteType) {
      return voteType === 1 ? '#FF4500' : '#7193ff';
    }
    return '#999';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.username?.[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.teamName}>{post.team_name}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.post_type && post.post_type !== 'discussion' && (
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{post.post_type.toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.voteContainer}>
          <TouchableOpacity onPress={handleUpvote} style={styles.voteButton}>
            <Text style={[styles.voteIcon, { color: getVoteColor(1) }]}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.voteCount}>{post.upvotes - post.downvotes}</Text>
          <TouchableOpacity onPress={handleDownvote} style={styles.voteButton}>
            <Text style={[styles.voteIcon, { color: getVoteColor(-1) }]}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statText}>
            {post.comment_count || 0} {post.comment_count === 1 ? 'comment' : 'comments'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  teamName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    padding: 8,
  },
  voteIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 8,
  },
  stats: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PostCard;
