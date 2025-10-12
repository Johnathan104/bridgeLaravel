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
        Schema::table('changes', function (Blueprint $table) {
            // pastikan dulu kolom urn ada di model_uploads
            $table->string('urn')->after('object_id')->nullable();

            // jadikan foreign key ke model_uploads.urn
            $table->foreign('urn')
                ->references('urn')
                ->on('model_uploads')
                ->onDelete('cascade'); // kalau model_upload dihapus, changes juga ikut terhapus
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('changes', function (Blueprint $table) {
            // drop foreign key sebelum drop column
            $table->dropForeign(['urn']);
            $table->dropColumn('urn');
        });
    }
};
