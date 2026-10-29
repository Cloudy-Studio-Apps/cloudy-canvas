import { CodeWriter } from "../../code";

/** A migration file: `up` and `down` bodies inside Laravel's anonymous migration class. */
export function migrationShell(
  up: (w: CodeWriter) => void,
  down: (w: CodeWriter) => void,
  usesDb: boolean,
): string {
  const w = new CodeWriter("    ");
  w.line("<?php").line();
  w.line("use Illuminate\\Database\\Migrations\\Migration;");
  w.line("use Illuminate\\Database\\Schema\\Blueprint;");
  if (usesDb) w.line("use Illuminate\\Support\\Facades\\DB;");
  w.line("use Illuminate\\Support\\Facades\\Schema;").line();
  w.line("return new class extends Migration").line("{");
  w.indent(() => {
    w.line("/**").line(" * Run the migrations.").line(" */");
    w.line("public function up(): void").line("{");
    w.indent(() => up(w));
    w.line("}").line();
    w.line("/**").line(" * Reverse the migrations.").line(" */");
    w.line("public function down(): void").line("{");
    w.indent(() => down(w));
    w.line("}");
  });
  w.line("};");
  return w.toString();
}
