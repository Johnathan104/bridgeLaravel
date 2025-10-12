<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('changes', function (Blueprint $table) {
            $table->id();
            $table->date('date'); // 📅 Tanggal perubahan
            $table->string('title'); // Judul perubahan
            $table->text('description')->nullable(); // Deskripsi, bisa panjang
            $table->string('pelapor'); // Nama pelapor
            $table->string('status')->default('direncanakan'); // Status perubahan (pending, approved, rejected)
            $table->unsignedBigInteger('object_id')->nullable(); // Relasi ke objek (misalnya Forge object_id)
            $table->timestamps(); // created_at & updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('changes');
    }
};
