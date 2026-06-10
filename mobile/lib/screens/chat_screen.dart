import 'package:flutter/material.dart';
import '../chat_store.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';

// Чат клиент↔мастер. Локальный мок: Realtime придёт с Supabase.
class ChatScreen extends StatefulWidget {
  final String masterSlug;
  final bool asClient; // true: пишет клиент, false: пишет мастер
  const ChatScreen(
      {super.key, required this.masterSlug, required this.asClient});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final chat = ChatStore.instance;
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();

  Color get _accent =>
      widget.asClient ? AppColors.accentClient : AppColors.accentMaster;

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      chat.send(widget.masterSlug, text, fromClient: widget.asClient);
      _ctrl.clear();
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.jumpTo(_scroll.position.maxScrollExtent);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.asClient
        ? ClientStore.instance.bySlug(widget.masterSlug).name
        : S.chatTitle;
    final messages = chat.forMaster(widget.masterSlug);

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scroll,
                padding: const EdgeInsets.all(16),
                itemCount: messages.length,
                itemBuilder: (_, i) {
                  final msg = messages[i];
                  final mine = msg.fromClient == widget.asClient;
                  return Align(
                    alignment: mine
                        ? Alignment.centerRight
                        : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      constraints: BoxConstraints(
                          maxWidth:
                              MediaQuery.of(context).size.width * 0.75),
                      decoration: BoxDecoration(
                        color: mine
                            ? _accent.withValues(alpha: 0.15)
                            : AppColors.bgCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: mine
                                ? _accent.withValues(alpha: 0.4)
                                : AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(msg.text,
                              style: const TextStyle(
                                  fontSize: 14, height: 1.4)),
                          Text(formatTime(msg.at),
                              style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textTertiary)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      decoration: const InputDecoration(
                        hintText: S.messageHint,
                        hintStyle:
                            TextStyle(color: AppColors.textTertiary),
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 10),
                  IconButton.filled(
                    style: IconButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: AppColors.bg),
                    onPressed: _send,
                    icon: const Icon(Icons.send, size: 20),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
