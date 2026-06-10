import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';

/// Маска телефона: цифры группируются как +XXX XX XXX XX XX.
/// Работает с любым кодом страны (E.164).
class PhoneFormatter extends TextInputFormatter {
  static const _groups = [3, 2, 3, 2, 2, 3];

  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    final buf = StringBuffer('+');
    var i = 0;
    for (final g in _groups) {
      if (i >= digits.length) break;
      if (i > 0) buf.write(' ');
      buf.write(digits.substring(i, (i + g).clamp(0, digits.length)));
      i += g;
    }
    final text = buf.toString();
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}

/// Код подтверждения: 4 ячейки с автопереходом.
/// Когда все заполнены — вызывает onComplete.
class OtpInput extends StatefulWidget {
  final void Function(String code) onComplete;
  const OtpInput({super.key, required this.onComplete});

  @override
  State<OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<OtpInput> {
  final _controllers = List.generate(4, (_) => TextEditingController());
  final _nodes = List.generate(4, (_) => FocusNode());

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  void _onChanged(int i, String v) {
    if (v.isNotEmpty && i < 3) _nodes[i + 1].requestFocus();
    if (v.isEmpty && i > 0) _nodes[i - 1].requestFocus();
    final code = _controllers.map((c) => c.text).join();
    if (code.length == 4) widget.onComplete(code);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(4, (i) {
        return SizedBox(
          width: 64,
          child: TextField(
            controller: _controllers[i],
            focusNode: _nodes[i],
            autofocus: i == 0,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 1,
            style: const TextStyle(
                fontSize: 26, fontWeight: FontWeight.w800),
            decoration: const InputDecoration(counterText: ''),
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            onChanged: (v) => _onChanged(i, v),
          ),
        );
      }),
    );
  }
}

/// Подпись «Шаг N из M» для онбординга
class StepLabel extends StatelessWidget {
  final int step;
  final int total;
  final Color accent;
  const StepLabel(
      {super.key,
      required this.step,
      required this.total,
      required this.accent});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ...List.generate(
          total,
          (i) => Container(
            width: 24,
            height: 4,
            margin: const EdgeInsets.only(right: 6),
            decoration: BoxDecoration(
              color: i < step ? accent : AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
      ],
    );
  }
}
