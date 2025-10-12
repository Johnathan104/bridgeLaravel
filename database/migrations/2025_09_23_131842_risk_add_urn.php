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
       Schema::table('risks', function (Blueprint $table) {
            $table->string('urn')->nullable()->after('jenis_risiko');
            $table->unsignedBigInteger('object_id')->nullable()->after('urn');
            $table->foreign('urn')
                ->references('urn')->on('model_uploads')
                ->onDelete('cascade');


        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('risks', function (Blueprint $table) {
            $table->dropForeign(['urn']);
            $table->dropColumn('urn');
            $table->dropColumn('object_id');
        });
    }
};
