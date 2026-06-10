import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../app_state.dart';
import '../client_store.dart' show kCategories;
import '../i18n.dart';
import '../theme.dart';
import '../widgets/inputs.dart';
import 'client_shell.dart';
import 'master_shell.dart';

// Онбординг: телефон → код → профиль/имя (+интересы для клиента).
// Код подтверждения пока тестовый (0000) — реальный OTP придёт с Supabase.

int _totalSteps(String role) => role == 'client' ? 4 : 3;

Color _accent(String role) =>
    role == 'client' ? AppColors.accentClient : AppColors.accentMaster;

class PhoneScreen extends StatefulWidget {
  final String role; // 'master' | 'client'
  const PhoneScreen({super.key, required this.role});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _ctrl = TextEditingController(text: '+998 ');
  String _error = '';

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _next() {
    // Любая страна: E.164 — от 8 до 15 цифр с кодом страны
    final digits = _ctrl.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 8 || digits.length > 15) {
      setState(() => _error = S.errPhone);
      return;
    }
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => OtpScreen(role: widget.role, phone: '+$digits'),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StepLabel(
                step: 1,
                total: _totalSteps(widget.role),
                accent: _accent(widget.role)),
            const SizedBox(height: 24),
            const Text(S.phoneTitle,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text(S.phoneSubtitle,
                style:
                    TextStyle(fontSize: 14, color: AppColors.textSecondary)),
            const SizedBox(height: 28),
            TextField(
              controller: _ctrl,
              keyboardType: TextInputType.phone,
              autofocus: true,
              inputFormatters: [PhoneFormatter()],
              style: const TextStyle(fontSize: 20),
              onSubmitted: (_) => _next(),
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(_error,
                  style: const TextStyle(
                      color: AppColors.warning, fontSize: 13)),
            ],
            const Spacer(),
            _PrimaryButton(
                label: S.continueBtn,
                accent: _accent(widget.role),
                onPressed: _next),
          ],
        ),
      ),
    );
  }
}

class OtpScreen extends StatefulWidget {
  final String role;
  final String phone;
  const OtpScreen({super.key, required this.role, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  String _error = '';

  static const _testCode = '0000';

  Future<void> _verify(String code) async {
    if (code != _testCode) {
      setState(() => _error = S.otpWrong);
      return;
    }
    HapticFeedback.lightImpact();
    final app = AppState.instance;
    app.phone = widget.phone;
    app.role = widget.role;
    if (!mounted) return;
    if (widget.role == 'client') {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const ClientNameScreen()),
      );
    } else {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const ProfileSetupScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StepLabel(
                step: 2,
                total: _totalSteps(widget.role),
                accent: _accent(widget.role)),
            const SizedBox(height: 24),
            const Text(S.otpTitle,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text('${S.otpSubtitle} ${widget.phone}',
                style: const TextStyle(
                    fontSize: 14, color: AppColors.textSecondary)),
            const SizedBox(height: 28),
            OtpInput(onComplete: _verify),
            const SizedBox(height: 12),
            const Text(S.otpTestHint,
                style:
                    TextStyle(fontSize: 13, color: AppColors.textTertiary)),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(_error,
                  style: const TextStyle(
                      color: AppColors.warning, fontSize: 13)),
            ],
          ],
        ),
      ),
    );
  }
}

class ClientNameScreen extends StatefulWidget {
  const ClientNameScreen({super.key});

  @override
  State<ClientNameScreen> createState() => _ClientNameScreenState();
}

class _ClientNameScreenState extends State<ClientNameScreen> {
  final _ctrl = TextEditingController();
  String _error = '';

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    if (_ctrl.text.trim().length < 2) {
      setState(() => _error = S.errRequired);
      return;
    }
    AppState.instance.name = _ctrl.text.trim();
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const InterestsScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const StepLabel(
                step: 3, total: 4, accent: AppColors.accentClient),
            const SizedBox(height: 24),
            const Text(S.yourName,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            const SizedBox(height: 28),
            TextField(
              controller: _ctrl,
              autofocus: true,
              style: const TextStyle(fontSize: 18),
              onSubmitted: (_) => _finish(),
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(_error,
                  style: const TextStyle(
                      color: AppColors.warning, fontSize: 13)),
            ],
            const Spacer(),
            _PrimaryButton(
                label: S.continueBtn,
                accent: AppColors.accentClient,
                onPressed: _finish),
          ],
        ),
      ),
    );
  }
}

class InterestsScreen extends StatefulWidget {
  const InterestsScreen({super.key});

  @override
  State<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends State<InterestsScreen> {
  final _selected = <String>{};

  Future<void> _finish() async {
    final app = AppState.instance;
    app.interests = _selected.toList();
    app.onboarded = true;
    await app.save();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const ClientShell()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const StepLabel(
                step: 4, total: 4, accent: AppColors.accentClient),
            const SizedBox(height: 24),
            const Text(S.interestsTitle,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text(S.interestsSubtitle,
                style:
                    TextStyle(fontSize: 14, color: AppColors.textSecondary)),
            const SizedBox(height: 24),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: kCategories.map((c) {
                final on = _selected.contains(c);
                return FilterChip(
                  label: Text(c),
                  selected: on,
                  onSelected: (_) => setState(
                      () => on ? _selected.remove(c) : _selected.add(c)),
                  selectedColor:
                      AppColors.accentClient.withValues(alpha: 0.15),
                  checkmarkColor: AppColors.accentClient,
                  labelStyle: TextStyle(
                      color: on
                          ? AppColors.accentClient
                          : AppColors.textSecondary),
                  backgroundColor: AppColors.bgCard,
                  side: BorderSide(
                      color:
                          on ? AppColors.accentClient : AppColors.border),
                );
              }).toList(),
            ),
            const Spacer(),
            _PrimaryButton(
                label: S.start,
                accent: AppColors.accentClient,
                onPressed: _finish),
          ],
        ),
      ),
    );
  }
}

class ProfileSetupScreen extends StatefulWidget {
  final bool editMode;
  const ProfileSetupScreen({super.key, this.editMode = false});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  late final _name = TextEditingController(text: AppState.instance.name);
  late final _spec =
      TextEditingController(text: AppState.instance.specialization);
  late final _address = TextEditingController(text: AppState.instance.address);
  late final _slug = TextEditingController(text: AppState.instance.slug);
  String _error = '';

  @override
  void dispose() {
    _name.dispose();
    _spec.dispose();
    _address.dispose();
    _slug.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    if (_name.text.trim().length < 2 || _spec.text.trim().isEmpty) {
      setState(() => _error = S.errRequired);
      return;
    }
    final app = AppState.instance;
    app.name = _name.text.trim();
    app.specialization = _spec.text.trim();
    app.address = _address.text.trim();
    app.slug = _slug.text.trim().toLowerCase().replaceAll(
        RegExp(r'[^a-z0-9-]'), '');
    app.onboarded = true;
    await app.save();
    if (!mounted) return;
    if (widget.editMode) {
      Navigator.of(context).pop(true);
    } else {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MasterShell()),
        (_) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: widget.editMode ? const Text(S.profile) : null),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          if (!widget.editMode) ...[
            const StepLabel(
                step: 3, total: 3, accent: AppColors.accentMaster),
            const SizedBox(height: 24),
            const Padding(
              padding: EdgeInsets.only(bottom: 24),
              child: Text(S.profileTitle,
                  style:
                      TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            ),
          ],
          _Field(label: S.profileName, controller: _name),
          _Field(
              label: S.profileSpec,
              controller: _spec,
              hint: S.profileSpecHint),
          _Field(
              label: S.profileAddress,
              controller: _address,
              hint: S.profileAddressHint),
          _Field(
              label: S.profileSlug,
              controller: _slug,
              hint: S.profileSlugHint,
              prefix: 'navbar.uz/'),
          if (_error.isNotEmpty)
            Text(_error,
                style:
                    const TextStyle(color: AppColors.warning, fontSize: 13)),
          const SizedBox(height: 20),
          _PrimaryButton(
              label: widget.editMode ? S.save : S.start,
              accent: AppColors.accentMaster,
              onPressed: _finish),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String? hint;
  final String? prefix;

  const _Field(
      {required this.label, required this.controller, this.hint, this.prefix});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: controller,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(color: AppColors.textTertiary),
              prefixText: prefix,
              prefixStyle: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  final String label;
  final Color accent;
  final VoidCallback onPressed;

  const _PrimaryButton(
      {required this.label, required this.accent, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: FilledButton(
        style: FilledButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: AppColors.bg,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onPressed: onPressed,
        child: Text(label,
            style:
                const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      ),
    );
  }
}
