import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { postsService } from '../services/postsService';
import { teamsService } from '../services/teamsService';

const CreatePostScreen = ({ navigation, route }) => {
  const [content, setContent] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(route.params?.teamId || null);
  const [postType, setPostType] = useState('discussion');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const postTypes = ['discussion', 'prediction', 'analysis', 'news'];

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const userTeams = await teamsService.getUserFavoriteTeams();
      setTeams(userTeams);
      if (!selectedTeamId && userTeams.length > 0) {
        setSelectedTeamId(userTeams[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load teams');
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    if (!selectedTeamId) {
      Alert.alert('Error', 'Please select a team');
      return;
    }

    setLoading(true);
    try {
      await postsService.createPost({
        teamId: selectedTeamId,
        content: content.trim(),
        postType,
        mediaUrls: [],
      });

      Alert.alert('Success', 'Post created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Select Team</Text>
        <View style={styles.teamList}>
          {teams.map((team) => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamChip,
                selectedTeamId === team.id && styles.teamChipActive,
              ]}
              onPress={() => setSelectedTeamId(team.id)}
            >
              <Text
                style={[
                  styles.teamChipText,
                  selectedTeamId === team.id && styles.teamChipTextActive,
                ]}
              >
                {team.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Post Type</Text>
        <View style={styles.typeList}>
          {postTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeChip,
                postType === type && styles.typeChipActive,
              ]}
              onPress={() => setPostType(type)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  postType === type && styles.typeChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={1000}
          editable={!loading}
        />
        <Text style={styles.charCount}>{content.length}/1000</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePost}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  teamList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
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
  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  typeChipActive: {
    backgroundColor: '#28a745',
  },
  typeChipText: {
    fontSize: 14,
    color: '#666',
  },
  typeChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreatePostScreen;
