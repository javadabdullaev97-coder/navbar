import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../app_state.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';
import 'booking_calendar.dart';
import 'chat_screen.dart';

// Цвета плиток портфолио (вместо фото до подключения Storage)
const _portfolioColors = [
  Color(0xFF2D4A22),
  Color(0xFF1F3A4D),
  Color(0xFF4A2D3E),
  Color(0xFF3E3A1F),
  Color(0xFF22404A),
  Color(0xFF40224A),
  Color(0xFF4A3522),
  Color(0xFF224A38),
  Color(0xFF3A224A),
  Color(0xFF4A2222),
  Color(0xFF22354A),
  Color(0xFF2E4A22),
  Color(0xFF4A4222),
];

class MasterProfileScreen extends StatefulWidget {
  final String slug;
  const MasterProfileScreen({super.key, required this.slug});

  @override
  State<MasterProfileScreen> createState() => _MasterProfileScreenState();
}

class _MasterProfileScreenState extends State<MasterProfileScreen> {
  final store = ClientStore.instance;
  final _selected = <String>{}; // id выбранных услуг

  MasterPublic get m => store.bySlug(widget.slug);

  List<Service> get _selectedServices =>
      m.services.where((s) => _selected.contains(s.id)).toList();

  int get _totalMin =>
      _selectedServices.fold(0, (a, s) => a + s.durationMin);
  int get _totalPrice => _selectedServices.fold(0, (a, s) => a + s.price);

  @override
  Widget build(BuildContext context) {
    final reviews = [...m.reviews]..sort((a, b) => b.at.compareTo(a.at));

    return Scaffold(
      appBar: AppBar(
        title: Text(m.name),
        actions: [
          IconButton(
            icon: Icon(
              AppState.instance.isFavorite(m.slug)
                  ? Icons.favorite
                  : Icons.favorite_border,
              color: AppState.instance.isFavorite(m.slug)
                  ? AppColors.warning
                  : AppColors.textSecondary,
            ),
            onPressed: () async {
              await AppState.instance.toggleFavorite(m.slug);
              setState(() {});
            },
          ),
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline,
                color: AppColors.accentClient),
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) =>
                    ChatScreen(masterSlug: m.slug, asClient: true))),
          ),
        ],
      ),
      bottomNavigationBar: _selected.isEmpty
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  height: 54,
                  child: FilledButton(
                    key: const ValueKey('choose-time'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.accentClient,
                      foregroundColor: AppColors.bg,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      final nav = Navigator.of(context);
                      final booked = await nav.push<bool>(MaterialPageRoute(
                        builder: (_) => BookingCalendarScreen(
                            slug: m.slug, services: _selectedServices),
                      ));
                      if (booked == true && mounted) nav.pop();
                    },
                    child: Text(
                        '${S.chooseSlots} · $_totalMin ${S.min} · ${formatPrice(_totalPrice, MockStore.instance.currencySuffix)}',
                        style: const TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w700)),
                  ),
                ),
              ),
            ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Шапка
            Row(
              children: [
                Hero(
                  tag: 'av-${m.slug}',
                  child: CircleAvatar(
                    radius: 30,
                    backgroundColor:
                        avatarColor(m.name).withValues(alpha: 0.15),
                    child: Text(m.name.characters.first,
                        style: TextStyle(
                            fontSize: 24,
                            color: avatarColor(m.name),
                            fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m.specialization,
                          style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          ...List.generate(
                              5,
                              (i) => Icon(
                                    i < m.rating.round()
                                        ? Icons.star
                                        : Icons.star_border,
                                    size: 16,
                                    color: AppColors.warning,
                                  )),
                          const SizedBox(width: 6),
                          Text(
                              '${m.rating.toStringAsFixed(1)} · ${m.reviews.length}',
                              style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      GestureDetector(
                        onTap: () => launchUrl(
                            Uri.parse(
                                'https://maps.google.com/?q=${Uri.encodeComponent(m.address)}'),
                            mode: LaunchMode.externalApplication),
                        child: Row(
                          children: [
                            const Icon(Icons.place_outlined,
                                size: 13, color: AppColors.accentClient),
                            const SizedBox(width: 3),
                            Flexible(
                              child: Text(m.address,
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.accentClient)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(m.bio,
                style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.5)),
            const SizedBox(height: 20),

            // Портфолио
            if (m.portfolio.isNotEmpty) ...[
              const _Title(S.portfolioTitle),
              SizedBox(
                height: 110,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: m.portfolio.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 10),
                  itemBuilder: (_, i) {
                    final p = m.portfolio[i];
                    return Container(
                      width: 110,
                      decoration: BoxDecoration(
                        color: _portfolioColors[
                            p.colorSeed % _portfolioColors.length],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(p.emoji,
                              style: const TextStyle(fontSize: 32)),
                          const SizedBox(height: 6),
                          Text(p.caption,
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textSecondary)),
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Услуги — мультивыбор
            const _Title(S.servicesTitle),
            ...m.services.map((s) {
              final on = _selected.contains(s.id);
              return GestureDetector(
                onTap: () => setState(
                    () => on ? _selected.remove(s.id) : _selected.add(s.id)),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: on
                            ? AppColors.accentClient
                            : AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Icon(
                          on
                              ? Icons.check_box
                              : Icons.check_box_outline_blank,
                          size: 20,
                          color: on
                              ? AppColors.accentClient
                              : AppColors.textTertiary),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.name,
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600)),
                            Text('${s.durationMin} ${S.min}',
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      Text(
                          formatPrice(
                              s.price, MockStore.instance.currencySuffix),
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: on
                                  ? AppColors.accentClient
                                  : AppColors.textSecondary)),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 20),

            // Отзывы
            _Title('${S.reviewsTitle} (${reviews.length})'),
            ...reviews.map((r) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(r.author,
                              style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600)),
                          const Spacer(),
                          ...List.generate(
                              r.stars,
                              (_) => const Icon(Icons.star,
                                  size: 13, color: AppColors.warning)),
                          const SizedBox(width: 8),
                          Text(formatDate(r.at),
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textTertiary)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(r.text,
                          style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              height: 1.4)),
                    ],
                  ),
                )),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}

class _Title extends StatelessWidget {
  final String text;
  const _Title(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(text.toUpperCase(),
          style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
              color: AppColors.textTertiary)),
    );
  }
}
