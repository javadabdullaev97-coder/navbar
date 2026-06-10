import 'models.dart';

// Локальный мок-чат клиент↔мастер. При подключении Supabase Realtime
// заменяется подпиской на таблицу messages.
class ChatStore {
  ChatStore._();
  static final ChatStore instance = ChatStore._();

  final _messages = <ChatMessage>[];

  List<ChatMessage> forMaster(String slug) =>
      _messages.where((m) => m.masterSlug == slug).toList();

  /// Мастера, с которыми есть переписка (для вкладки чатов мастера —
  /// в мок-режиме это переписки клиента с Асрором).
  List<String> activeChats() =>
      _messages.map((m) => m.masterSlug).toSet().toList();

  void send(String masterSlug, String text, {required bool fromClient}) {
    _messages.add(ChatMessage(
      masterSlug: masterSlug,
      fromClient: fromClient,
      text: text,
      at: DateTime.now(),
    ));
  }
}
