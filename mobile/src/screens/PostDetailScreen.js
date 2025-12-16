import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { postsService } from '../services/postsService';
import PostCard from '../components/PostCard';

const PostDetailScreen = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await postsService.getPostById(postId);
      setPost(data.post);
      setComments(data.comments);
    } catch (error) {
      Alert.alert('Error', 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      await postsService.votePost(postId, voteType);
      const oldVote = post.user_vote || 0;
      const upvoteDelta = (voteType === 1 ? 1 : 0) - (oldVote === 1 ? 1 : 0);
      const downvoteDelta = (voteType === -1 ? 1 : 0) - (oldVote === -1 ? 1 : 0);

      setPost({
        ...post,
        upvotes: post.upvotes + upvoteDelta,
        downvotes: post.downvotes + downvoteDelta,
        user_vote: voteType,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    try {
      await postsService.votePost(commentId, voteType);
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          const oldVote = comment.user_vote || 0;
          const upvoteDelta = (voteType === 1 ? 1 : 0) - (oldVote === 1 ? 1 : 0);
          const downvoteDelta = (voteType === -1 ? 1 : 0) - (oldVote === -1 ? 1 : 0);

          return {
            ...comment,
            upvotes: comment.upvotes + upvoteDelta,
            downvotes: comment.downvotes + downvoteDelta,
            user_vote: voteType,
          };
        }
        return comment;
      });
      setComments(updatedComments);
    } catch (error) {
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const comment = await postsService.createPost({
        teamId: post.team_id,
        content: newComment.trim(),
        postType: 'discussion',
        parentPostId: postId,
      });

      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !post) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <PostCard post={post} onVote={handleVote} />

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({comments.length})
          </Text>

          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {comment.username?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.commentUsername}>{comment.username}</Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <View style={styles.commentFooter}>
                <View style={styles.voteContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      handleCommentVote(comment.id, comment.user_vote === 1 ? 0 : 1)
                    }
                  >
                    <Text
                      style={[
                        styles.voteIcon,
                        comment.user_vote === 1 && styles.voteIconActive,
                      ]}
                    >
                      ▲
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.voteCount}>
                    {comment.upvotes - comment.downvotes}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleCommentVote(comment.id, comment.user_vote === -1 ? 0 : -1)
                    }
                  >
                    <Text
                      style={[
                        styles.voteIcon,
                        comment.user_vote === -1 && styles.voteIconActive,
                      ]}
                    >
                      ▼
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          editable={!submitting}
        />
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  commentsSection: {
    padding: 12,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  commentContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteIcon: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  voteIconActive: {
    color: '#FF4500',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  submitButton: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PostDetailScreen;
