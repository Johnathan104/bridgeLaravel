<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->string('description');       // deskripsi risiko
            $table->string('status')->nullable();
            $table->date('tanggal')->nullable();
            $table->decimal('biaya', 15, 2)->nullable();
            $table->enum('prioritas', ['rendah', 'sedang', 'tinggi'])->default('rendah');
            $table->string('jenis_risiko')->nullable();
   
            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risks');
    }
};
