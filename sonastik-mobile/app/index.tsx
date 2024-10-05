import { useState, useMemo } from "react";
import {
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  Keyboard,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import { Ionicons } from '@expo/vector-icons';
import { useGetWordExplanation } from "@/components/side-effects";
import { WithLoadingCenter } from "@/components/WithLoadingCenter";

export default function Index() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeaning, setSelectedMeaning] = useState(null);

  const [debouncedSearch] = useDebounce(search, 1000);

  const { loading: isLoading, dictionary } = useGetWordExplanation(debouncedSearch, {
    skip: debouncedSearch.length === 0,
    onCompleted: (_data: any) => {
      Keyboard.dismiss();
    }
  });

  const meanings = useMemo(() => {
    return dictionary?.searchResult?.flatMap((result: any) => {
      const wordClasses = result.wordClasses;
      const similarWords = result.similarWords;
      const wordForms = result.wordForms;
      const meanings = result.meanings;

      return meanings.map((meaning: any) => {
        return {
          ...meaning,
          wordClasses,
          similarWords,
          wordForms,
          id: Date.now() + Math.floor(Math.random() * 1000),
        };
      });
    });
  }, [dictionary]);

  const insets = useSafeAreaInsets();

  const handleMeaningPress = (meaning: any) => {
    setModalVisible(true);
    setSelectedMeaning(meaning);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start",
            alignItems: "stretch",
            width: "100%",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ alignSelf: "center", fontSize: 48, fontWeight: "bold", paddingTop: 50 }}>Sõnastik</Text>
          <SearchInput search={search} setSearch={setSearch} />
          <WithLoadingCenter isLoading={isLoading}>
            {meanings?.length > 0 && (
              <View style={{ flex: 1, paddingHorizontal: 20, alignItems: "flex-start", justifyContent: "flex-start", width: "100%" }}>
                <Text style={{ textAlign: "left", fontSize: 18, marginTop: 20 }}>
                  Found {meanings?.length} definitions for "{dictionary?.estonianWord}"
                </Text>
                <SearchResults
                  meanings={meanings}
                  onPressHandler={handleMeaningPress}
                />
              </View>
            )}
          </WithLoadingCenter>
        </ScrollView>
      </KeyboardAvoidingView>
      <MeaningModal
        meaning={selectedMeaning}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        insets={insets}
      />
    </SafeAreaView>
  );
}

const SearchInput = ({ search, setSearch }: { search: string, setSearch: (search: string) => void }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingHorizontal: 20 }}>
      <TextInput
        placeholder="What word are you looking for?"
        value={search}
        onChangeText={setSearch}
        style={{
          flex: 1,
          borderWidth: 2,
          borderColor: '#1f2937',
          borderRadius: 8,
          padding: 10,
          height: 44,
        }}
      />
      {search.length > 0 && (
        <TouchableOpacity
          onPress={() => setSearch('')}
          style={{
            padding: 10,
            position: 'absolute',
            right: 20,
          }}
        >
          <Ionicons name="close-circle" size={20} color="gray" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const SearchResults = ({ meanings, onPressHandler }: { meanings: any[], onPressHandler: (meaning: any) => void }) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginTop: 20,
        width: '100%',
      }}
    >
      {meanings.map((meaning, index) => (
        <Pressable
          key={`${meaning.id}-${index}`}
          onPress={() => {
            onPressHandler(meaning);
          }}
          style={{ width: "100%" }}
        >
          <DefinitionRow
            definition={meaning.definition}
            definitionEn={meaning.definitionEn}
          />
        </Pressable>
      ))}
    </View>
  );
};

const DefinitionRow = ({ definition, definitionEn, showCTA = true, style }: { definition: string, definitionEn: any, showCTA?: boolean, style?: any }) => {
  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#cbd5e1",
        flex: 1,
        width: "100%",
        paddingHorizontal: 5,
        paddingVertical: 10,
        marginBottom: 20,
        ...style,
      }}>
      <View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", marginBottom: 10 }}>
        <LanguageBadge language="ET" />
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>{definition}</Text>
      </View>
      <View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", marginBottom: 10 }}>
        <LanguageBadge language="EN" />
        <Text style={{ fontSize: 16 }}>{definitionEn.translations?.[0]?.text}</Text>
      </View>
      {showCTA && <Text style={{ fontSize: 14, color: "#2563eb", textAlign: "center", marginTop: 10, fontWeight: "bold" }}>Tap to see example sentences and details</Text>}
    </View>
  );
};

const LanguageBadge = ({ language }: { language: string }) => {
  return (
    <View style={{
      borderWidth: 1,
      borderColor: "#cbd5e1",
      borderRadius: 8,
      paddingHorizontal: 5,
      paddingVertical: 2,
      marginRight: 10,
      marginBottom: 5,
    }}>
      <Text>{language}</Text>
    </View>
  );
};

const MeaningModal = ({ meaning, modalVisible, setModalVisible, insets }: { meaning: any, modalVisible: boolean, setModalVisible: (visible: boolean) => void, insets: any }) => {
  if (!meaning) {
    return null;
  }

  return (
    <Modal
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
      transparent={true}
      style={{ backgroundColor: "white" }}
    >
      <ScrollView
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 20,
            paddingTop: insets.top,
            paddingBottom: 20,
            justifyContent: "flex-end",
            alignItems: "flex-end",
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
          }}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable content */}
        <View style={{ padding: 20 }}>
          <DefinitionRow
            definition={meaning.definition}
            definitionEn={meaning.definitionEn}
            showCTA={false}
            style={{ borderWidth: 0, borderRadius: 0, borderColor: "transparent" }}
          />
          {meaning.examples.length > 0 && (
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                Examples:
              </Text>
              {meaning.examples.map((example: string, idx: number) => (
                <Text
                  key={`example-${idx}`}
                  style={{ fontSize: 16, marginBottom: 5 }}
                >
                  {`- ${example}`}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
