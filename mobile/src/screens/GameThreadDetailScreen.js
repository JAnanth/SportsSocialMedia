import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { gameThreadsService } from '../services/gameThreadsService';
import websocketService from '../services/websocketService';

const GameThreadDetailScreen = ({ route }) => {
  const { gameThreadId } = route.params;
  const [gameThread, setGameThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [postPhase, setPostPhase] = useState('live');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadGameThread();
    loadPosts();
    setupWebSocket();

    return () => {
      websocketService.leaveGameThread(gameThreadId);
    };
  }, [gameThreadId]);

  const setupWebSocket = () => {
    websocketService.joinGameThread(gameThreadId);

    websocketService.on('new_game_thread_message', (message) => {
      setPosts((prevPosts) => [...prevPosts, message]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);
    });

    websocketService.on('score_updated', (data) => {
      if (data.gameThreadId === gameThreadId) {
        setGameThread((prev) => ({
          ...prev,
          home_score: data.homeScore,
          away_score: data.awayScore,
        }));
      }
    });
  };

  const loadGameThread = async () => {
    try {
      const thread = await gameThreadsService.getGameThreadById(gameThreadId);
      setGameThread(thread);

      // Auto-detect phase based on game status
      if (thread.status === 'scheduled') setPostPhase('pre-game');
      else if (thread.status === 'live') setPostPhase('live');
      else if (thread.status === 'completed') setPostPhase('post-game');
    } catch (error) {
      console.error('Load game thread error:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const postsData = await gameThreadsService.getGameThreadPosts(gameThreadId);
      setPosts(postsData);
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    websocketService.sendGameThreadMessage(gameThreadId, newMessage.trim(), postPhase);
    setNewMessage('');
  };

  const renderPost = ({ item }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <View style={styles.messageAvatar}>
          <Text style={styles.avatarText}>{item.username?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.messageUsername}>{item.username}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
    </View>
  );

  if (loading || !gameThread) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.matchup}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{gameThread.team_name}</Text>
            {gameThread.status !== 'scheduled' && (
              <Text style={styles.score}>{gameThread.home_score}</Text>
            )}
          </View>
          <Text style={styles.vs}>vs</Text>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{gameThread.opponent_name}</Text>
            {gameThread.status !== 'scheduled' && (
              <Text style={styles.score}>{gameThread.away_score}</Text>
            )}
          </View>
        </View>

        <View style={styles.phaseSelector}>
          {['pre-game', 'live', 'post-game'].map((phase) => (
            <TouchableOpacity
              key={phase}
              style={[styles.phaseButton, postPhase === phase && styles.phaseButtonActive]}
              onPress={() => setPostPhase(phase)}
            >
              <Text
                style={[
                  styles.phaseButtonText,
                  postPhase === phase && styles.phaseButtonTextActive,
                ]}
              >
                {phase}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={posts.filter((p) => p.post_phase === postPhase)}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  matchup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamInfo: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  vs: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  phaseSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  phaseButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  phaseButtonActive: {
    backgroundColor: '#007AFF',
  },
  phaseButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  phaseButtonTextActive: {
    color: '#fff',
  },
  messageList: {
    padding: 12,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageAvatar: {
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
  messageUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
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
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default GameThreadDetailScreen;
