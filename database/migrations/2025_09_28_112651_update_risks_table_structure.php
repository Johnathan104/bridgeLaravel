<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risks', function (Blueprint $table) {
            // Tambahkan kolom baru
            $table->string('risk_code')->nullable();          // ID Risiko
            $table->string('project_name')->nullable();       // Nama proyek
            $table->date('tanggal_kejadian')->nullable();     // Tanggal kejadian
            $table->text('deskripsi_risiko')->nullable();     // Deskripsi risiko
            $table->text('penyebab')->nullable();             // Penyebab risiko
            $table->text('dampak')->nullable();               // Dampak risiko
            $table->text('tindakan_mitigasi')->nullable();    // Tindakan mitigasi

            // Hapus kolom lama yang tidak dipakai (opsional)
            $table->dropColumn(['description', 'tanggal', 'biaya', 'prioritas', 'jenis_risiko']);
        });
    }

    public function down(): void
    {
        Schema::table('risks', function (Blueprint $table) {
            $table->dropColumn([
                'risk_code',
                'project_name',
                'tanggal_kejadian',
                'deskripsi_risiko',
                'penyebab',
                'dampak',
                'tindakan_mitigasi',
            ]);

            // Kembalikan kolom lama jika perlu rollback
            $table->text('description')->nullable();
            $table->date('tanggal')->nullable();
            $table->decimal('biaya', 15, 2)->nullable();
            $table->string('prioritas')->nullable();
            $table->string('jenis_risiko')->nullable();
        });
    }
};
