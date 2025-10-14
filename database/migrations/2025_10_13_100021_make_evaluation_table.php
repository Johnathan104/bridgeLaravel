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
        //
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('change_id');
            $table->integer('ratings'); // e.g., 1 to 5
            $table->text('comments')->nullable();
            $table->text('evaluated_by');
            $table->text('evaluation_date');
            $table->text('variansi_rencana');
            $table->timestamps();
            $table->foreign('change_id')->references('id')->on('changes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('evaluations');
    }
};
