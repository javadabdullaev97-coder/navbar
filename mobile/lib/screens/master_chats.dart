import 'package:flutter/material.dart';
import '../chat_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';
import 'chat_screen.dart';

// Чаты мастера. В мок-режиме здесь появляются переписки,
// начатые клиентом (демо в рамках одной сессии).
class MasterChatsScreen extends StatefulWidget {
  const MasterChatsScreen({super.key});

  @override
  State<MasterChatsScreen> createState() => _MasterChatsScreenState();
}

class _MasterChatsScreenState extends State<MasterChatsScreen> {
  @override
  Widget build(BuildContext context) {
    final chats = ChatStore.instance.activeChats();

    return Scaffold(
      appBar: AppBar(title: const Text(S.navChats)),
      body: SafeArea(
        child: chats.isEmpty
            ? const Center(
                child: Text(S.noChats,
                    style: TextStyle(color: AppColors.textTertiary)),
              )
            : ListView(
                padding: const EdgeInsets.all(16),
                children: chats.map((slug) {
                  final messages = ChatStore.instance.forMaster(slug);
                  final last = messages.last;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: ListTile(
                      onTap: () async {
                        await Navigator.of(context).push(MaterialPageRoute(
                            builder: (_) => ChatScreen(
                                masterSlug: slug, asClient: false)));
                        setState(() {});
                      },
                      leading: CircleAvatar(
                        backgroundColor:
                            AppColors.accentMaster.withValues(alpha: 0.12),
                        child: const Icon(Icons.person,
                            color: AppColors.accentMaster, size: 20),
                      ),
                      title: Text(
                          MockStore.instance.clients.isNotEmpty
                              ? MockStore.instance.clients.last.name
                              : 'Клиент',
                          style: const TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w600)),
                      subtitle: Text(last.text,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary)),
                      trailing: Text(formatTime(last.at),
                          style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textTertiary)),
                    ),
                  );
                }).toList(),
              ),
      ),
    );
  }
}
